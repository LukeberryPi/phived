import SwiftUI

struct TaskPanel: View {
    @EnvironmentObject private var store: TaskStore
    @Environment(\.palette) private var palette
    @FocusState.Binding var focusedTask: Int?
    @State private var hovering: Int?

    var body: some View {
        VStack(spacing: 0) {
            ForEach(store.tasks.indices, id: \.self) { index in
                HStack(spacing: 0) {
                    TextField(index == 0 && store.filledTaskCount == 0 ? "\(store.placeholder)?" : "", text: $store.tasks[index])
                        .textFieldStyle(.plain)
                        .font(.custom("DM Sans", size: 18))
                        .padding(.horizontal, 20)
                        .frame(height: 61)
                        .focused($focusedTask, equals: index)
                        .onSubmit { focusedTask = (index + 1) % TaskStore.taskCount }
                        .onKeyPress(
                            keys: [.return, .upArrow, .downArrow, .escape],
                            phases: .down
                        ) { handleKeyPress($0, index: index) }
                    if !store.tasks[index].isBlank && (hovering == index || focusedTask == index) {
                        PhivedIcon(name: "drag-vertical", size: 26)
                            .frame(width: 32, height: 61)
                            .onDrag { NSItemProvider(object: "\(index)" as NSString) }
                        Button("done") { store.complete(index) }
                            .buttonStyle(.plain)
                            .frame(width: 80, height: 61)
                            .background(palette.accent)
                            .overlay(alignment: .leading) { Rectangle().fill(palette.line).frame(width: 1) }
                    }
                }
                .background(palette.surface)
                .onHover { hovering = $0 ? index : nil }
                .onDrop(of: [.text], delegate: TaskDropDelegate(destination: index, store: store))
                if index < TaskStore.taskCount - 1 { Rectangle().fill(palette.line).frame(height: 1) }
            }
        }
        .frame(width: store.taskPanelWidth)
        .background(palette.surface)
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .overlay { RoundedRectangle(cornerRadius: 16).stroke(palette.edge, lineWidth: 1) }
        .shadow(color: palette.shadow, radius: 0, x: 3, y: 3)
        .overlay(alignment: .bottomTrailing) {
            ResizeHandle(width: $store.taskPanelWidth)
        }
    }

    private func handleKeyPress(_ press: KeyPress, index: Int) -> KeyPress.Result {
        if press.key == .escape {
            focusedTask = nil
            return .handled
        }

        if press.key == .return,
           press.modifiers.contains(.command) || press.modifiers.contains(.control) {
            store.complete(index)
            return .handled
        }

        let movingUp = press.key == .upArrow
            || (press.key == .return && press.modifiers.contains(.shift))
        let movingDown = press.key == .downArrow || press.key == .return
        guard movingUp || movingDown else { return .ignored }

        let offset = movingUp ? -1 : 1
        let destination = (index + offset + TaskStore.taskCount) % TaskStore.taskCount
        if press.modifiers.contains(.option), store.tasks.indices.contains(index + offset) {
            store.move(from: index, to: index + offset)
            focusedTask = index + offset
        } else {
            focusedTask = destination
        }
        return .handled
    }
}

struct ResizeHandle: View {
    @Binding var width: Double
    @State private var startingWidth: Double?

    var body: some View {
        Image(systemName: "arrow.up.left.and.arrow.down.right")
            .font(.system(size: 8, weight: .medium))
            .foregroundStyle(.secondary)
            .frame(width: 16, height: 16)
            .contentShape(Rectangle())
            .gesture(
                DragGesture()
                    .onChanged { value in
                        if startingWidth == nil { startingWidth = width }
                        let proposed = (startingWidth ?? width) + value.translation.width
                        width = min(TaskStore.maxPanelWidth, max(TaskStore.minPanelWidth, proposed))
                    }
                    .onEnded { _ in startingWidth = nil }
            )
    }
}

struct TaskDropDelegate: DropDelegate {
    let destination: Int
    let store: TaskStore
    func performDrop(info: DropInfo) -> Bool {
        guard let provider = info.itemProviders(for: [.text]).first else { return false }
        provider.loadObject(ofClass: NSString.self) { value, _ in
            guard let source = Int(value as? String ?? "") else { return }
            Task { @MainActor in store.move(from: source, to: destination) }
        }
        return true
    }
}
