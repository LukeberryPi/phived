import SwiftUI

struct ContentView: View {
    @EnvironmentObject private var store: TaskStore
    @Environment(\.palette) private var palette
    @State private var hotkeysOpen = false
    @FocusState private var focusedTask: Int?

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
    @Environment(\.palette) private var palette
    @Binding var hotkeysOpen: Bool

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
