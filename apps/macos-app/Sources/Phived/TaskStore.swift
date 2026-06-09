import Foundation
import SwiftUI

struct HistoryEntry: Codable, Identifiable, Equatable {
    let id: UUID
    let text: String
    let completedAt: Date
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
    static let taskCount = 5
    static let minPanelWidth: Double = 300
    static let maxPanelWidth: Double = 720
    static let defaultPanelWidth: Double = 400

    @Published var tasks: [String] { didSet { persistTasks() } }
    @Published var history: [HistoryEntry] { didSet { persistHistory() } }
    @Published var theme: ThemePreference { didSet { persist(theme.rawValue, key: Keys.theme) } }
    @Published var helpOpen: Bool { didSet { persist(helpOpen, key: Keys.help) } }
    @Published var historyOpen: Bool { didSet { persist(historyOpen, key: Keys.historyOpen) } }
    @Published var taskPanelWidth: Double { didSet { persist(taskPanelWidth, key: Keys.panelWidth) } }
    @Published var toasts: [ToastMessage] = []
    @Published var confirmation: Confirmation?
    let placeholder: String

    private let defaults: UserDefaults
    private var persistenceEnabled = false

    enum Confirmation {
        case tasks, history
    }

    struct ToastMessage: Identifiable, Equatable {
        let id: UUID
        let text: String
        let isError: Bool
    }

    private enum Keys {
        static let tasks = "storedGeneralTasks"
        static let history = "taskHistory"
        static let theme = "themePreference"
        static let help = "showHelpMenu"
        static let historyOpen = "showTaskHistoryDrawer"
        static let panelWidth = "tasksComponentWidth"
    }

    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
        tasks = Self.decode([String].self, from: defaults.data(forKey: Keys.tasks))
            .map(Self.normalized) ?? Self.emptyTasks()
        history = Self.decode([HistoryEntry].self, from: defaults.data(forKey: Keys.history)) ?? []
        theme = ThemePreference(rawValue: defaults.string(forKey: Keys.theme) ?? "") ?? .system
        helpOpen = defaults.object(forKey: Keys.help) as? Bool ?? true
        historyOpen = defaults.object(forKey: Keys.historyOpen) as? Bool ?? true
        taskPanelWidth = defaults.object(forKey: Keys.panelWidth) as? Double ?? Self.defaultPanelWidth
        placeholder = AppContent.placeholders.randomElement()!

        persistenceEnabled = !seedSnapshotStateIfRequested()
    }

    var filledTaskCount: Int { tasks.filter { !$0.isBlank }.count }

    func complete(_ index: Int) {
        guard tasks.indices.contains(index) else { return }
        let text = tasks[index].trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return }
        tasks.remove(at: index)
        tasks.append("")
        history.insert(HistoryEntry(id: UUID(), text: text, completedAt: Date()), at: 0)
        showToast(AppContent.incentives.randomElement()!)
    }

    func restore(_ entry: HistoryEntry) {
        guard let slot = tasks.firstIndex(where: { $0.isBlank }) else {
            showToast("can't restore — you already have 5 tasks! complete one first.", error: true)
            return
        }
        tasks[slot] = entry.text
        history.removeAll { $0.id == entry.id }
        showToast("task restored!")
    }

    func move(from source: Int, to destination: Int) {
        guard tasks.indices.contains(source), tasks.indices.contains(destination), source != destination else { return }
        let item = tasks.remove(at: source)
        tasks.insert(item, at: destination)
    }

    func requestClearTasks() {
        if filledTaskCount == 0 { showToast("no tasks to clear.") }
        else { confirmation = .tasks }
    }

    func confirmDeletion() {
        guard let confirmation else { return }
        if confirmation == .tasks {
            tasks = Self.emptyTasks()
            showToast("tasks cleared!")
        } else {
            history = []
            showToast("history cleared!")
        }
        self.confirmation = nil
    }

    func cycleTheme() {
        theme = theme.next
        showToast(theme.toastCopy)
    }

    func showToast(_ text: String, error: Bool = false) {
        let message = ToastMessage(id: UUID(), text: text, isError: error)
        toasts.append(message)
        if toasts.count > 3 {
            toasts.removeFirst(toasts.count - 3)
        }
        Task {
            try? await Task.sleep(for: .seconds(4))
            toasts.removeAll { $0.id == message.id }
        }
    }

    static func emptyTasks() -> [String] { Array(repeating: "", count: taskCount) }

    private func persistTasks() {
        guard persistenceEnabled else { return }
        defaults.set(try? JSONEncoder().encode(tasks), forKey: Keys.tasks)
    }

    private func persistHistory() {
        guard persistenceEnabled else { return }
        defaults.set(try? JSONEncoder().encode(history), forKey: Keys.history)
    }

    private func persist(_ value: Any, key: String) {
        guard persistenceEnabled else { return }
        defaults.set(value, forKey: key)
    }

    private static func decode<T: Decodable>(_ type: T.Type, from data: Data?) -> T? {
        guard let data else { return nil }
        return try? JSONDecoder().decode(type, from: data)
    }

    private static func normalized(_ values: [String]) -> [String] {
        Array((values + emptyTasks()).prefix(taskCount))
    }
}
