import SwiftUI

struct CanvasView: View {
    @EnvironmentObject private var store: TaskStore
    @Environment(\.palette) private var palette
    @State private var panStart: CanvasViewport?
    @State private var zoomStart: Double?

    var body: some View {
        GeometryReader { proxy in
            ZStack(alignment: .topLeading) {
                Color(nsColor: .windowBackgroundColor).opacity(0.35)
                canvas
                    .offset(x: store.viewport.x, y: store.viewport.y)
                    .scaleEffect(store.viewport.zoom, anchor: .topLeading)
                CanvasControls(viewSize: proxy.size)
            }
            .contentShape(Rectangle())
            .gesture(panGesture(viewSize: proxy.size))
            .simultaneousGesture(zoomGesture(viewSize: proxy.size))
            .onTapGesture(count: 2) { location in
                let point = CanvasGeometry.canvasPoint(for: location, viewport: store.viewport)
                let origin = CanvasGeometry.listOrigin(centeredAt: point)
                _ = store.addList(x: origin.x, y: origin.y)
            }
            .onAppear {
                if store.viewport.x == 0, store.viewport.y == 0 {
                    store.setViewport(CanvasGeometry.centeredViewport(in: proxy.size), viewSize: proxy.size)
                }
            }
        }
    }

    private var canvas: some View {
        ZStack(alignment: .topLeading) {
            DottedCanvas()
                .fill(palette.canvas)
                .overlay { Rectangle().stroke(palette.edge.opacity(0.35), lineWidth: 2) }
            ForEach(store.lists) { list in
                TaskListCard(listId: list.id)
                    .opacity(store.focusedListId == nil || store.focusedListId == list.id ? 1 : 0.1)
                    .allowsHitTesting(store.focusedListId == nil || store.focusedListId == list.id)
                    .position(x: list.x + list.width / 2, y: list.y + listHeight(list) / 2)
            }
        }
        .frame(width: TaskStore.canvasWidth, height: TaskStore.canvasHeight)
    }

    private func listHeight(_ list: TaskList) -> Double {
        28 + Double(list.tasks.count) * 49 + 42 + 42
    }

    private func panGesture(viewSize: CGSize) -> some Gesture {
        DragGesture(minimumDistance: 2)
            .onChanged { value in
                if panStart == nil { panStart = store.viewport }
                guard let start = panStart else { return }
                store.setViewport(CanvasViewport(
                    x: start.x + value.translation.width,
                    y: start.y + value.translation.height,
                    zoom: start.zoom
                ), viewSize: viewSize)
            }
            .onEnded { _ in panStart = nil }
    }

    private func zoomGesture(viewSize: CGSize) -> some Gesture {
        MagnificationGesture()
            .onChanged { value in
                if zoomStart == nil { zoomStart = store.viewport.zoom }
                store.setViewport(CanvasViewport(
                    x: store.viewport.x,
                    y: store.viewport.y,
                    zoom: (zoomStart ?? store.viewport.zoom) * value
                ), viewSize: viewSize)
            }
            .onEnded { _ in zoomStart = nil }
    }
}

private struct DottedCanvas: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        stride(from: 0.0, through: rect.width, by: 32).forEach { x in
            stride(from: 0.0, through: rect.height, by: 32).forEach { y in
                path.addEllipse(in: CGRect(x: x, y: y, width: 3, height: 3))
            }
        }
        return path
    }
}

struct CanvasControls: View {
    @EnvironmentObject private var store: TaskStore
    @Environment(\.palette) private var palette
    let viewSize: CGSize

    var body: some View {
        HStack(spacing: 12) {
            controlButton("plus", "new list") {
                let center = CanvasGeometry.canvasPoint(
                    for: CGPoint(x: viewSize.width / 2, y: viewSize.height / 2),
                    viewport: store.viewport
                )
                let cascade = Double(store.lists.count % 5) * 28
                let origin = CanvasGeometry.listOrigin(centeredAt: center, cascade: cascade)
                _ = store.addList(x: origin.x, y: origin.y)
            }
            HStack(spacing: 0) {
                controlButton("minus", nil) { zoom(by: 1 / 1.2) }
                Button("\(Int((store.viewport.zoom * 100).rounded()))%") {
                    store.setViewport(CanvasViewport(x: store.viewport.x, y: store.viewport.y, zoom: 1), viewSize: viewSize)
                }
                .buttonStyle(.plain)
                .frame(minWidth: 56, minHeight: 44)
                controlButton("plus", nil) { zoom(by: 1.2) }
            }
            .background(palette.surface)
            .clipShape(RoundedRectangle(cornerRadius: 16))
            .overlay { RoundedRectangle(cornerRadius: 16).stroke(palette.edge) }
        }
        .position(x: viewSize.width / 2, y: viewSize.height - 42)
    }

    private func controlButton(_ symbol: String, _ label: String?, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 8) {
                Image(systemName: symbol)
                if let label { Text(label) }
            }
            .frame(minHeight: 44)
            .padding(.horizontal, 14)
            .background(palette.surface)
        }
        .buttonStyle(.plain)
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .overlay { RoundedRectangle(cornerRadius: 16).stroke(palette.edge) }
    }

    private func zoom(by factor: Double) {
        store.setViewport(
            CanvasViewport(x: store.viewport.x, y: store.viewport.y, zoom: store.viewport.zoom * factor),
            viewSize: viewSize
        )
    }
}

struct TaskListCard: View {
    @EnvironmentObject private var store: TaskStore
    @Environment(\.palette) private var palette
    let listId: UUID
    @State private var moveStart: CGPoint?
    @State private var widthStart: Double?
    @FocusState private var focusedRow: Int?

    private var list: TaskList? { store.lists.first { $0.id == listId } }

    var body: some View {
        if let list {
            VStack(spacing: 0) {
                TextField("add a tag", text: Binding(
                    get: { list.tag },
                    set: { store.updateTag(listId, $0) }
                ))
                .textFieldStyle(.plain)
                .font(.custom("DM Sans", size: 14).weight(.medium))
                .padding(.horizontal, 12)
                .frame(height: 28)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(palette.accent)
                .clipShape(UnevenRoundedRectangle(topLeadingRadius: 10, topTrailingRadius: 10))

                VStack(spacing: 0) {
                    ForEach(list.tasks.indices, id: \.self) { index in
                        TaskRow(listId: listId, index: index, focusedRow: $focusedRow)
                        if index < list.tasks.count - 1 { Rectangle().fill(palette.line).frame(height: 1) }
                    }
                    Rectangle().fill(palette.line).frame(height: 1)
                    Button {
                        store.addRow(listId)
                        focusedRow = list.tasks.count
                    } label: {
                        Label("add row", systemImage: "plus")
                            .frame(maxWidth: .infinity, minHeight: 42)
                    }
                    .buttonStyle(.plain)
                    .foregroundStyle(palette.muted)
                }
                .background(palette.surface)
                .clipShape(UnevenRoundedRectangle(bottomLeadingRadius: 16, bottomTrailingRadius: 16))
                .overlay { UnevenRoundedRectangle(bottomLeadingRadius: 16, bottomTrailingRadius: 16).stroke(palette.edge) }
                .shadow(color: palette.shadow, radius: 0, x: 3, y: 3)
                .overlay(alignment: .trailing) {
                    Rectangle()
                        .fill(palette.edge)
                        .frame(width: 8, height: 36)
                        .clipShape(Capsule())
                        .offset(x: 4)
                        .gesture(resizeGesture(list))
                        .help("resize list")
                }

                HStack(spacing: 4) {
                    iconButton("arrow.up.and.down.and.arrow.left.and.right", "move list") {}
                        .gesture(moveGesture(list))
                    iconButton(
                        "scope",
                        store.focusedListId == listId ? "unfocus list" : "focus list"
                    ) {
                        store.focusedListId = store.focusedListId == listId ? nil : listId
                    }
                    iconButton("trash", "delete list") { store.requestDeleteList(listId) }
                        .foregroundStyle(.red)
                }
                .frame(height: 42)
            }
            .frame(width: list.width)
            .onTapGesture { store.bringToFront(listId) }
        }
    }

    private func iconButton(_ symbol: String, _ label: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(systemName: symbol).frame(width: 34, height: 34)
        }
        .buttonStyle(.plain)
        .help(label)
        .accessibilityLabel(label)
    }

    private func moveGesture(_ list: TaskList) -> some Gesture {
        DragGesture()
            .onChanged { value in
                if moveStart == nil { moveStart = CGPoint(x: list.x, y: list.y) }
                guard let start = moveStart else { return }
                let position = CanvasGeometry.movedListPosition(
                    start: start,
                    translation: value.translation,
                    zoom: store.viewport.zoom
                )
                store.moveList(listId, x: position.x, y: position.y)
            }
            .onEnded { _ in moveStart = nil }
    }

    private func resizeGesture(_ list: TaskList) -> some Gesture {
        DragGesture()
            .onChanged { value in
                if widthStart == nil { widthStart = list.width }
                let width = CanvasGeometry.resizedListWidth(
                    startWidth: widthStart ?? list.width,
                    translationWidth: value.translation.width,
                    zoom: store.viewport.zoom
                )
                store.resizeList(listId, width: width)
            }
            .onEnded { _ in widthStart = nil }
    }
}

struct TaskRow: View {
    @EnvironmentObject private var store: TaskStore
    @Environment(\.palette) private var palette
    let listId: UUID
    let index: Int
    @FocusState.Binding var focusedRow: Int?
    @State private var hovering = false

    private var list: TaskList? { store.lists.first { $0.id == listId } }

    var body: some View {
        if let list, list.tasks.indices.contains(index) {
            HStack(spacing: 0) {
                TextField(
                    index == 0 && list.tasks.allSatisfy(\.isBlank) ? "\(store.placeholder)?" : "",
                    text: Binding(
                        get: { self.list?.tasks[safe: index] ?? "" },
                        set: { store.updateTask(listId, index: index, value: $0) }
                    )
                )
                .textFieldStyle(.plain)
                .font(.custom("DM Sans", size: 16))
                .padding(.horizontal, 16)
                .frame(height: 48)
                .focused($focusedRow, equals: index)
                .onKeyPress(keys: [.return, .upArrow, .downArrow, .escape, .delete], phases: .down) {
                    handleKeyPress($0, list: list)
                }
                if !list.tasks[index].isBlank && (hovering || focusedRow == index) {
                    PhivedIcon(name: "drag-vertical", size: 22)
                        .frame(width: 28, height: 48)
                        .onDrag { TaskDragPayload(listId: listId, index: index).itemProvider() }
                    Button("done") { store.complete(listId, index: index) }
                        .buttonStyle(.plain)
                        .frame(width: 70, height: 48)
                        .background(palette.accent)
                }
            }
            .frame(height: 48)
            .onHover { hovering = $0 }
            .onDrop(of: [TaskDragPayload.contentType], delegate: TaskDropDelegate(listId: listId, destination: index, store: store))
        }
    }

    private func handleKeyPress(_ press: KeyPress, list: TaskList) -> KeyPress.Result {
        if press.key == .escape {
            focusedRow = nil
            return .handled
        }
        if press.key == .delete, list.tasks[index].isEmpty, list.tasks.count > TaskStore.minimumRows {
            store.removeEmptyExtraRow(listId, index: index)
            focusedRow = max(0, index - 1)
            return .handled
        }
        if press.key == .return, press.modifiers.contains(.command) || press.modifiers.contains(.control) {
            store.complete(listId, index: index)
            return .handled
        }
        if press.modifiers.contains(.option), press.key == .upArrow || press.key == .downArrow {
            let destination = index + (press.key == .upArrow ? -1 : 1)
            guard list.tasks.indices.contains(destination) else { return .handled }
            store.reorderTask(listId, from: index, to: destination)
            focusedRow = destination
            return .handled
        }
        if press.key == .upArrow {
            focusedRow = TaskKeyboardPolicy.arrowUpFocus(from: index, taskCount: list.tasks.count)
            return .handled
        }
        if press.key == .downArrow {
            focusedRow = TaskKeyboardPolicy.arrowDownFocus(from: index, taskCount: list.tasks.count)
            return .handled
        }
        if press.key == .return {
            let above = press.modifiers.contains(.shift)
            switch TaskKeyboardPolicy.freshRowDecision(tasks: list.tasks, index: index, above: above) {
            case .focus(let target):
                focusedRow = target
            case .insert(let insertion, let focus):
                store.insertRow(listId, at: insertion)
                focusedRow = focus
            case nil:
                break
            }
            return .handled
        }
        return .ignored
    }
}

struct TaskDropDelegate: DropDelegate {
    let listId: UUID
    let destination: Int
    let store: TaskStore

    func performDrop(info: DropInfo) -> Bool {
        guard let provider = info.itemProviders(for: [TaskDragPayload.contentType]).first else { return false }
        TaskDragPayload.load(from: provider) { payload in
            guard let payload, payload.listId == listId else { return }
            Task { @MainActor in store.reorderTask(listId, from: payload.index, to: destination) }
        }
        return true
    }

    func validateDrop(info: DropInfo) -> Bool {
        info.hasItemsConforming(to: [TaskDragPayload.contentType])
    }
}

private extension Array {
    subscript(safe index: Index) -> Element? {
        indices.contains(index) ? self[index] : nil
    }
}
