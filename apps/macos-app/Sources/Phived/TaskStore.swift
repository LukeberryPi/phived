import Foundation
import SwiftUI

struct TaskList: Codable, Identifiable, Equatable {
    let id: UUID
    var tag: String
    var x: Double
    var y: Double
    var width: Double
    var tasks: [String]
}

struct CanvasViewport: Codable, Equatable {
    var x: Double
    var y: Double
    var zoom: Double
}

struct HistoryEntry: Codable, Identifiable, Equatable {
    let id: UUID
    let text: String
    let completedAt: Date
    let listId: UUID?
    let listTag: String?

    init(id: UUID = UUID(), text: String, completedAt: Date = Date(), listId: UUID? = nil, listTag: String? = nil) {
        self.id = id
        self.text = text
        self.completedAt = completedAt
        self.listId = listId
        self.listTag = listTag
    }
}

enum ThemePreference: String, Codable, CaseIterable {
    case system, dark, light

    var next: Self {
        let values = Self.allCases
        return values[(values.firstIndex(of: self)! + 1) % values.count]
    }

    var toastCopy: String {
        switch self {
        case .system: "set to \"follow your OS preference\""
        case .dark: "set to \"always dark mode\""
        case .light: "set to \"always light mode\""
        }
    }
}

@MainActor
final class TaskStore: ObservableObject {
    static let minimumRows = 5
    static let canvasWidth = CanvasGeometry.canvasWidth
    static let canvasHeight = CanvasGeometry.canvasHeight
    static let defaultListWidth = CanvasGeometry.defaultListWidth
    static let minimumListWidth = CanvasGeometry.minimumListWidth
    static let maximumListWidth = CanvasGeometry.maximumListWidth
    static let minimumZoom = CanvasGeometry.minimumZoom
    static let maximumZoom = CanvasGeometry.maximumZoom

    @Published var lists: [TaskList] { didSet { persist(lists, key: Keys.lists) } }
    @Published var history: [HistoryEntry] { didSet { persist(history, key: Keys.history) } }
    @Published var viewport: CanvasViewport { didSet { persist(viewport, key: Keys.viewport) } }
    @Published var theme: ThemePreference { didSet { defaults.set(theme.rawValue, forKey: Keys.theme) } }
    @Published var helpOpen: Bool { didSet { defaults.set(helpOpen, forKey: Keys.help) } }
    @Published var historyOpen: Bool { didSet { defaults.set(historyOpen, forKey: Keys.historyOpen) } }
    @Published var focusedListId: UUID?
    @Published var toasts: [ToastMessage] = []
    @Published var confirmation: Confirmation?

    let placeholder: String
    private let defaults: UserDefaults
    private var persistenceEnabled = false

    enum Confirmation: Equatable {
        case canvas
        case history
        case list(UUID)
    }

    struct ToastMessage: Identifiable, Equatable {
        let id: UUID
        let text: String
        let isError: Bool
    }

    private enum Keys {
        static let lists = "canvasLists"
        static let history = "taskHistory"
        static let viewport = "canvasViewport"
        static let legacyTasks = "storedGeneralTasks"
        static let theme = "themePreference"
        static let help = "showHelpMenu"
        static let historyOpen = "showTaskHistoryDrawer"
    }

    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
        if let stored = Self.decode([TaskList].self, from: defaults.data(forKey: Keys.lists)), !stored.isEmpty {
            lists = stored.map(Self.normalized)
        } else {
            let legacy = Self.decode([String].self, from: defaults.data(forKey: Keys.legacyTasks)) ?? []
            lists = [Self.centeredList(tasks: legacy)]
        }
        history = Self.decode([HistoryEntry].self, from: defaults.data(forKey: Keys.history)) ?? []
        viewport = Self.decode(CanvasViewport.self, from: defaults.data(forKey: Keys.viewport))
            ?? CanvasViewport(x: 0, y: 0, zoom: 1)
        theme = ThemePreference(rawValue: defaults.string(forKey: Keys.theme) ?? "") ?? .system
        helpOpen = defaults.object(forKey: Keys.help) as? Bool ?? true
        historyOpen = defaults.object(forKey: Keys.historyOpen) as? Bool ?? true
        placeholder = AppContent.placeholders.randomElement()!
        persistenceEnabled = !seedSnapshotStateIfRequested()
    }

    var hasContent: Bool {
        lists.count > 1 || lists.contains { !$0.tag.isBlank || $0.tasks.contains { !$0.isBlank } }
    }

    func addList(x: Double, y: Double) -> UUID {
        let list = Self.makeList(x: x, y: y)
        lists.append(list)
        return list.id
    }

    func updateTag(_ listId: UUID, _ tag: String) {
        updateList(listId) { $0.tag = tag }
    }

    func updateTask(_ listId: UUID, index: Int, value: String) {
        updateList(listId) {
            guard $0.tasks.indices.contains(index) else { return }
            $0.tasks[index] = value
        }
    }

    func addRow(_ listId: UUID) {
        updateList(listId) { $0.tasks.append("") }
    }

    func insertRow(_ listId: UUID, at index: Int) {
        updateList(listId) {
            guard index >= 0, index <= $0.tasks.count else { return }
            $0.tasks.insert("", at: index)
        }
    }

    func removeEmptyExtraRow(_ listId: UUID, index: Int) {
        updateList(listId) {
            guard $0.tasks.count > Self.minimumRows,
                  $0.tasks.indices.contains(index), $0.tasks[index].isBlank else { return }
            $0.tasks.remove(at: index)
        }
    }

    func complete(_ listId: UUID, index: Int) {
        guard let list = lists.first(where: { $0.id == listId }),
              list.tasks.indices.contains(index) else { return }
        let text = list.tasks[index].trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return }
        updateList(listId) {
            $0.tasks.remove(at: index)
            $0.tasks = Self.normalizedTasks($0.tasks)
        }
        let tag = list.tag.trimmingCharacters(in: .whitespacesAndNewlines)
        history.insert(HistoryEntry(text: text, listId: listId, listTag: tag.isEmpty ? nil : tag), at: 0)
        showToast(AppContent.incentives.randomElement()!)
    }

    func restore(_ entry: HistoryEntry) {
        let targetId = lists.contains(where: { $0.id == entry.listId }) ? entry.listId : lists.first?.id
        let listId = targetId ?? addList(x: Self.canvasWidth / 2 - Self.defaultListWidth / 2, y: Self.canvasHeight / 2 - 280)
        updateList(listId) {
            if let empty = $0.tasks.firstIndex(where: \.isBlank) {
                $0.tasks[empty] = entry.text
            } else {
                $0.tasks.append(entry.text)
            }
            $0.tasks = Self.normalizedTasks($0.tasks)
        }
        history.removeAll { $0.id == entry.id }
        showToast("task restored!")
    }

    func reorderTask(_ listId: UUID, from source: Int, to destination: Int) {
        updateList(listId) {
            guard $0.tasks.indices.contains(source), $0.tasks.indices.contains(destination), source != destination else { return }
            let task = $0.tasks.remove(at: source)
            $0.tasks.insert(task, at: destination)
        }
    }

    func moveList(_ listId: UUID, x: Double, y: Double) {
        updateList(listId) {
            let position = CanvasGeometry.clampListPosition(x: x, y: y, width: $0.width)
            $0.x = position.x
            $0.y = position.y
        }
    }

    func resizeList(_ listId: UUID, width: Double) {
        updateList(listId) { $0.width = CanvasGeometry.clampListWidth(width) }
    }

    func bringToFront(_ listId: UUID) {
        guard let index = lists.firstIndex(where: { $0.id == listId }), index != lists.indices.last else { return }
        lists.append(lists.remove(at: index))
    }

    func requestDeleteList(_ listId: UUID) {
        guard let list = lists.first(where: { $0.id == listId }) else { return }
        if list.tasks.allSatisfy(\.isBlank) {
            lists.removeAll { $0.id == listId }
        } else {
            confirmation = .list(listId)
        }
    }

    func requestClearCanvas() {
        if hasContent { confirmation = .canvas }
        else { showToast("no tasks to clear.") }
    }

    func confirmDeletion() {
        guard let confirmation else { return }
        switch confirmation {
        case .canvas:
            lists = [Self.centeredList()]
            focusedListId = nil
            showToast("canvas cleared!")
        case .history:
            history = []
            showToast("history cleared!")
        case .list(let id):
            lists.removeAll { $0.id == id }
            if focusedListId == id { focusedListId = nil }
            showToast("list deleted!")
        }
        self.confirmation = nil
    }

    func setViewport(_ next: CanvasViewport, viewSize: CGSize? = nil) {
        if let viewSize {
            viewport = CanvasGeometry.clampViewport(next, in: viewSize)
        } else {
            viewport = CanvasViewport(
                x: next.x,
                y: next.y,
                zoom: CanvasGeometry.clampZoom(next.zoom)
            )
        }
    }

    func cycleTheme() {
        theme = theme.next
        showToast(theme.toastCopy)
    }

    func showToast(_ text: String, error: Bool = false) {
        let message = ToastMessage(id: UUID(), text: text, isError: error)
        toasts.append(message)
        if toasts.count > 3 { toasts.removeFirst(toasts.count - 3) }
        Task {
            try? await Task.sleep(for: .seconds(4))
            toasts.removeAll { $0.id == message.id }
        }
    }

    static func emptyTasks() -> [String] { Array(repeating: "", count: minimumRows) }

    static func centeredList(tasks: [String] = []) -> TaskList {
        makeList(
            x: canvasWidth / 2 - defaultListWidth / 2,
            y: canvasHeight / 2 - 280,
            tasks: tasks
        )
    }

    static func makeList(x: Double, y: Double, tag: String = "", tasks: [String] = []) -> TaskList {
        let position = CanvasGeometry.clampListPosition(x: x, y: y)
        return TaskList(id: UUID(), tag: tag, x: position.x, y: position.y, width: defaultListWidth, tasks: normalizedTasks(tasks))
    }

    static func normalizedTasks(_ tasks: [String]) -> [String] {
        var result = tasks
        if result.count < minimumRows {
            result.append(contentsOf: Array(repeating: "", count: minimumRows - result.count))
        }
        if !(result.last ?? "").isBlank { result.append("") }
        return result
    }

    private static func normalized(_ list: TaskList) -> TaskList {
        var result = list
        result.width = CanvasGeometry.clampListWidth(result.width)
        let position = CanvasGeometry.clampListPosition(x: result.x, y: result.y, width: result.width)
        result.x = position.x
        result.y = position.y
        result.tasks = normalizedTasks(result.tasks)
        return result
    }

    private func updateList(_ id: UUID, mutate: (inout TaskList) -> Void) {
        guard let index = lists.firstIndex(where: { $0.id == id }) else { return }
        var list = lists[index]
        mutate(&list)
        lists[index] = list
    }

    private func persist<T: Encodable>(_ value: T, key: String) {
        guard persistenceEnabled else { return }
        defaults.set(try? JSONEncoder().encode(value), forKey: key)
    }

    private static func decode<T: Decodable>(_ type: T.Type, from data: Data?) -> T? {
        guard let data else { return nil }
        return try? JSONDecoder().decode(type, from: data)
    }
}
