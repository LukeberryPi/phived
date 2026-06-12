import SwiftUI

struct ContentView: View {
    @EnvironmentObject private var store: TaskStore
    @Environment(\.palette) private var palette
    @State private var hotkeysOpen = false

    init() {
        _hotkeysOpen = State(initialValue: ProcessInfo.processInfo.environment["PHIVED_SNAPSHOT_STATE"] == "hotkeys")
    }

    var body: some View {
        ZStack {
            CanvasView()
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
        .background(palette.canvas)
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
            headerButton(icon: "trash", label: "clear canvas", muted: !store.hasContent, action: store.requestClearCanvas)
            headerButton(icon: "keyboard", label: "show hotkeys") { hotkeysOpen = true }
        }
        .padding(.horizontal, 24)
        .frame(height: 64)
        .font(.custom("DM Sans", size: 14))
        .foregroundStyle(palette.ink)
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
            .background(palette.canvas.opacity(0.94))
            .clipShape(RoundedRectangle(cornerRadius: 16))
        }
        .buttonStyle(.plain)
        .foregroundStyle(muted ? palette.muted : palette.ink)
    }
}
