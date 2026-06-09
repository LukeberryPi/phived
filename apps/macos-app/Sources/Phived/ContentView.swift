import SwiftUI

struct Palette {
    let canvas: Color
    let surface: Color
    let surfaceHover: Color
    let line: Color
    let edge: Color
    let ink: Color
    let muted: Color
    let accent: Color

    static func current(_ scheme: ColorScheme) -> Self {
        scheme == .dark
            ? Self(canvas: Color(hex: 0x0A0C10), surface: Color(hex: 0x14171D), surfaceHover: Color(hex: 0x1B1F27), line: Color(hex: 0x262B34), edge: Color(hex: 0x363D49), ink: Color(hex: 0xE2E5EA), muted: Color(hex: 0x8B919D), accent: Color(hex: 0x155E75))
            : Self(canvas: Color(hex: 0xF9FAFB), surface: .white, surfaceHover: Color(hex: 0xF4F4F5), line: Color(hex: 0xA1A1AA), edge: .black, ink: .black, muted: Color(hex: 0x71717A), accent: Color(hex: 0x7DD3FC))
    }
}

struct ContentView: View {
    @EnvironmentObject private var store: TaskStore
    @Environment(\.colorScheme) private var scheme
    @State private var hotkeysOpen = false
    @FocusState private var focusedTask: Int?

    private var palette: Palette { .current(scheme) }

    init() {
        _hotkeysOpen = State(
            initialValue: ProcessInfo.processInfo.environment["PHIVED_SNAPSHOT_STATE"] == "hotkeys"
        )
    }

    var body: some View {
        ZStack {
            palette.canvas.ignoresSafeArea()
            VStack(spacing: 16) {
                Text("what do you want to do?")
                    .font(.custom("DM Sans", size: 24))
                TaskPanel(focusedTask: $focusedTask)
            }
            .foregroundStyle(palette.ink)
            HeaderView(hotkeysOpen: $hotkeysOpen)
                .frame(maxHeight: .infinity, alignment: .top)
            DrawersView()
            if !store.toasts.isEmpty { ToastStack(messages: store.toasts) }
            if hotkeysOpen {
                ModalBackdrop { hotkeysOpen = false } content: {
                    HotkeysView(onClose: { hotkeysOpen = false })
                }
            }
            if store.confirmation != nil {
                ModalBackdrop { store.confirmation = nil } content: {
                    DeletionDialog()
                }
            }
        }
        .font(.custom("DM Sans", size: 16))
        .ignoresSafeArea()
        .onReceive(NotificationCenter.default.publisher(for: .showHotkeys)) { _ in hotkeysOpen = true }
    }
}

struct HeaderView: View {
    @EnvironmentObject private var store: TaskStore
    @Environment(\.colorScheme) private var scheme
    @Binding var hotkeysOpen: Bool
    private var palette: Palette { .current(scheme) }

    var body: some View {
        HStack {
            Text("phived")
                .font(.custom("DM Sans", size: 36))
                .underline(color: palette.accent)
            Spacer()
            headerButton(icon: themeIcon, label: store.theme.rawValue, action: store.cycleTheme)
            headerButton(icon: "trash", label: "clear tasks", muted: store.filledTaskCount == 0, action: store.requestClearTasks)
            headerButton(icon: "keyboard", label: "show hotkeys") { hotkeysOpen = true }
        }
        .padding(.horizontal, 24)
        .frame(height: 64)
        .font(.custom("DM Sans", size: 14))
    }

    private var themeIcon: String {
        switch store.theme { case .system: "computer"; case .dark: "moon"; case .light: "sun" }
    }

    private func headerButton(icon: String, label: String, muted: Bool = false, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 8) {
                PhivedIcon(name: icon)
                Text(label)
            }
            .padding(.horizontal, 12)
            .frame(height: 48)
        }
            .buttonStyle(.plain)
            .foregroundStyle(muted ? palette.muted : palette.ink)
    }
}

struct TaskPanel: View {
    @EnvironmentObject private var store: TaskStore
    @Environment(\.colorScheme) private var scheme
    @FocusState.Binding var focusedTask: Int?
    @State private var hovering: Int?
    private var palette: Palette { .current(scheme) }

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
                    if !store.tasks[index].trimmingCharacters(in: .whitespacesAndNewlines).isEmpty && (hovering == index || focusedTask == index) {
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
        .shadow(color: scheme == .dark ? .clear : Color(hex: 0x080811), radius: 0, x: 3, y: 3)
        .overlay(alignment: .bottomTrailing) {
            ResizeHandle(width: $store.taskPanelWidth)
        }
    }

    private func focus(_ index: Int) -> KeyPress.Result {
        focusedTask = (index + TaskStore.taskCount) % TaskStore.taskCount
        return .handled
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
                        width = min(720, max(300, (startingWidth ?? width) + value.translation.width))
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

struct DrawersView: View {
    @EnvironmentObject private var store: TaskStore
    var body: some View {
        VStack {
            Spacer()
            HStack(alignment: .bottom) {
                Drawer(open: $store.helpOpen, closedLabel: "show help", openLabel: "hide help", icon: "question") { HelpView() }
                Spacer()
                Drawer(
                    open: $store.historyOpen,
                    closedLabel: "show history",
                    openLabel: "hide history",
                    icon: "clock",
                    badge: store.history.count,
                    trailingAction: store.history.isEmpty ? nil : AnyView(
                        Button {
                            store.confirmation = .history
                        } label: {
                            PhivedIcon(name: "trash")
                                .frame(width: 48, height: 48)
                        }
                        .buttonStyle(.plain)
                    )
                ) {
                    HistoryView()
                }
            }
            .padding(24)
        }
    }
}

struct Drawer<Content: View>: View {
    @Environment(\.colorScheme) private var scheme
    @Binding var open: Bool
    let closedLabel: String
    let openLabel: String
    let icon: String
    var badge = 0
    var trailingAction: AnyView?
    @ViewBuilder let content: () -> Content
    private var palette: Palette { .current(scheme) }

    var body: some View {
        VStack(spacing: 0) {
            if open {
                content()
                    .frame(maxWidth: .infinity)
            }
            HStack(spacing: 0) {
                Button { withAnimation(.easeOut(duration: 0.15)) { open.toggle() } } label: {
                    HStack {
                        PhivedIcon(name: icon)
                        Text(open ? openLabel : closedLabel)
                        if badge > 0 { Text("\(badge)").font(.caption).frame(width: 24, height: 24).background(palette.accent).clipShape(Circle()) }
                    }
                    .padding(.horizontal, 16).frame(height: 48)
                }
                .buttonStyle(.plain)
                .frame(maxWidth: open ? .infinity : nil, alignment: .leading)
                if open, let trailingAction {
                    Rectangle().fill(palette.line).frame(width: 1)
                    trailingAction
                }
            }
            .overlay(alignment: .top) { if open { Rectangle().fill(palette.line).frame(height: 1) } }
        }
        .background(palette.surface)
        .frame(width: open ? 352 : nil)
        .fixedSize(horizontal: false, vertical: true)
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .overlay { RoundedRectangle(cornerRadius: 16).stroke(palette.edge, lineWidth: 1) }
    }
}

struct HelpView: View {
    @EnvironmentObject private var store: TaskStore

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Welcome to **phived, the anti-procrastination to-do list.**")
            Text("Stay focused on what matters. You can only have up to five tasks at a time.")
            Text("To add a new task, you first have to **finish one you're already working on.**")
            Text("No login. No ads. No distractions.")
            HStack(spacing: 4) {
                Link("Open Source", destination: URL(string: "https://www.github.com/lukeberrypi/phived")!).underline()
                Text("and free. Forever.")
            }
        }
        .font(.custom("DM Sans", size: 14))
        .padding(20)
        .overlay(alignment: .topTrailing) {
            Button { store.helpOpen = false } label: {
                PhivedIcon(name: "close", size: 18)
                    .frame(width: 32, height: 32)
            }
            .buttonStyle(.plain)
            .padding(.top, 8)
            .padding(.trailing, 8)
        }
    }
}

struct HistoryView: View {
    @EnvironmentObject private var store: TaskStore
    @Environment(\.colorScheme) private var scheme
    private var palette: Palette { .current(scheme) }
    var body: some View {
        VStack(spacing: 0) {
            if store.history.isEmpty {
                Text("nothing here yet — complete a task first.")
                    .foregroundStyle(palette.muted)
                    .frame(maxWidth: .infinity, minHeight: 48, alignment: .leading)
                    .padding(.horizontal, 16)
            } else {
                ForEach(store.history) { entry in
                    HistoryRow(entry: entry)
                    if entry.id != store.history.last?.id {
                        Rectangle().fill(palette.line).frame(height: 1)
                    }
                }
            }
        }
    }
}

struct HistoryRow: View {
    @EnvironmentObject private var store: TaskStore
    @Environment(\.colorScheme) private var scheme
    @State private var hovering = false
    let entry: HistoryEntry
    private var palette: Palette { .current(scheme) }

    var body: some View {
        HStack(spacing: 12) {
            Text(entry.text)
                .font(.custom("DM Sans", size: 14).weight(.medium))
                .lineLimit(1)
            Spacer()
            Text(historyWhen(entry.completedAt))
                .font(.custom("DM Sans", size: 12))
                .foregroundStyle(palette.muted)
            if hovering {
                Button("restore") { store.restore(entry) }
                    .buttonStyle(.plain)
                    .font(.custom("DM Sans", size: 14).weight(.medium))
                    .frame(width: 80, height: 48)
                    .background(palette.accent)
            }
        }
        .padding(.leading, 16)
        .padding(.trailing, hovering ? 0 : 16)
        .frame(height: 48)
        .onHover { hovering = $0 }
    }
}

struct ToastView: View {
    @Environment(\.colorScheme) private var scheme
    let message: TaskStore.ToastMessage
    private var palette: Palette { .current(scheme) }
    var body: some View {
        Text(message.text)
            .padding(.horizontal, 20)
            .frame(minWidth: 260, minHeight: 48)
            .background(message.isError ? Color.red.opacity(0.15) : palette.surface)
            .clipShape(RoundedRectangle(cornerRadius: 16))
            .overlay { RoundedRectangle(cornerRadius: 16).stroke(message.isError ? .red : palette.edge) }
        .transition(.move(edge: .bottom).combined(with: .opacity))
    }
}

struct ToastStack: View {
    let messages: [TaskStore.ToastMessage]

    var body: some View {
        VStack {
            Spacer()
            VStack(spacing: 8) {
                ForEach(messages) { ToastView(message: $0) }
            }
            .padding(.bottom, 88)
        }
    }
}

struct ModalBackdrop<Content: View>: View {
    let onDismiss: () -> Void
    @ViewBuilder let content: () -> Content

    var body: some View {
        ZStack {
            Color.black.opacity(0.68)
                .ignoresSafeArea()
                .onTapGesture(perform: onDismiss)
            content()
                .transition(.scale(scale: 0.97).combined(with: .opacity))
        }
        .animation(.easeOut(duration: 0.2), value: true)
        .onExitCommand(perform: onDismiss)
    }
}

struct DeletionDialog: View {
    @EnvironmentObject private var store: TaskStore
    @Environment(\.colorScheme) private var scheme
    private var palette: Palette { .current(scheme) }

    private var isTasks: Bool { store.confirmation == .tasks }

    var body: some View {
        VStack(spacing: 0) {
            HStack {
                Text(isTasks ? "delete every task?" : "clear task history?")
                    .font(.custom("DM Sans", size: 20).weight(.medium))
                Spacer()
                Button { store.confirmation = nil } label: {
                    PhivedIcon(name: "close", size: 18).frame(width: 32, height: 32)
                }
                .buttonStyle(.plain)
            }
            .padding(.leading, 20)
            .padding(.trailing, 16)
            .frame(height: 64)
            Rectangle().fill(palette.line).frame(height: 1)
            Text(isTasks
                 ? "This clears all tasks immediately. They will not move to history."
                 : "This removes every completed task from history. There is no undo for this action.")
                .foregroundStyle(palette.muted)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(20)
            Rectangle().fill(palette.line).frame(height: 1)
            HStack(spacing: 0) {
                Button(isTasks ? "keep tasks" : "keep history") { store.confirmation = nil }
                    .buttonStyle(.plain)
                    .frame(maxWidth: .infinity, minHeight: 52)
                Rectangle().fill(palette.line).frame(width: 1)
                Button(isTasks ? "delete tasks" : "clear history") { store.confirmDeletion() }
                    .buttonStyle(.plain)
                    .foregroundStyle(.red)
                    .frame(maxWidth: .infinity, minHeight: 52)
            }
        }
        .frame(width: 448)
        .fixedSize(horizontal: false, vertical: true)
        .background(palette.surface)
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .overlay { RoundedRectangle(cornerRadius: 16).stroke(palette.line) }
    }
}

struct HotkeysView: View {
    let onClose: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack {
                Text("keyboard shortcuts").font(.custom("DM Sans", size: 20).weight(.medium))
                Spacer()
                Button(action: onClose) { PhivedIcon(name: "close", size: 18) }.buttonStyle(.plain)
            }
            .padding(.horizontal, 20)
            .frame(height: 64)
            Divider()
            HStack(alignment: .top, spacing: 80) {
                shortcutSection("navigation", [
                    ("next task", [["enter"], ["↓"]]),
                    ("previous task", [["shift", "enter"], ["↑"]]),
                    ("unfocus task", [["esc"]])
                ])
                shortcutSection("action", [
                    ("complete task", [["⌘", "enter"]]),
                    ("move task up", [["⌥", "↑"]]),
                    ("move task down", [["⌥", "↓"]])
                ])
            }
            .padding(20)
        }
        .frame(width: 768)
        .fixedSize(horizontal: false, vertical: true)
        .background(.background)
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    private func shortcutSection(_ title: String, _ rows: [(String, [[String]])]) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title).font(.custom("DM Sans", size: 18).weight(.medium))
            ForEach(rows, id: \.0) { row in
                HStack {
                    Text(row.0)
                    Spacer()
                    ShortcutKeys(combos: row.1)
                }
            }
        }
        .frame(maxWidth: .infinity)
    }
}

struct ShortcutKeys: View {
    let combos: [[String]]

    var body: some View {
        HStack(spacing: 6) {
            ForEach(Array(combos.enumerated()), id: \.offset) { comboIndex, combo in
                if comboIndex > 0 {
                    Text("or").font(.custom("DM Sans", size: 14)).foregroundStyle(.secondary)
                }
                HStack(spacing: 6) {
                    ForEach(Array(combo.enumerated()), id: \.offset) { keyIndex, key in
                        if keyIndex > 0 {
                            Text("+").font(.custom("DM Sans", size: 14)).foregroundStyle(.secondary)
                        }
                        Text(key)
                            .font(.custom("DM Sans", size: 14))
                            .padding(.horizontal, 8)
                            .frame(minWidth: 32, minHeight: 28)
                            .background(Color.primary.opacity(0.05))
                            .clipShape(RoundedRectangle(cornerRadius: 4))
                            .overlay { RoundedRectangle(cornerRadius: 4).stroke(Color.secondary.opacity(0.5)) }
                    }
                }
            }
        }
    }
}

private func historyWhen(_ date: Date) -> String {
    let days = Calendar.current.dateComponents([.day], from: Calendar.current.startOfDay(for: date), to: Calendar.current.startOfDay(for: Date())).day ?? 0
    switch days {
    case 0: return "earlier today"
    case 1: return "yesterday"
    case 2...6: return "a few days ago"
    default: return "over a week ago"
    }
}

extension Color {
    init(hex: UInt) {
        self.init(red: Double((hex >> 16) & 0xff) / 255, green: Double((hex >> 8) & 0xff) / 255, blue: Double(hex & 0xff) / 255)
    }
}
