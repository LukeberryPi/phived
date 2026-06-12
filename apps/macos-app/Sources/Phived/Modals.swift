import SwiftUI

struct ModalBackdrop<Content: View>: View {
    let onDismiss: () -> Void
    @ViewBuilder let content: () -> Content
    @State private var shown = false

    var body: some View {
        ZStack {
            Color.black.opacity(shown ? 0.68 : 0)
                .ignoresSafeArea()
                .onTapGesture(perform: onDismiss)
            if shown {
                content()
                    .transition(.scale(scale: 0.97).combined(with: .opacity))
            }
        }
        .onAppear { withAnimation(.easeOut(duration: 0.2)) { shown = true } }
        .onExitCommand(perform: onDismiss)
    }
}

struct DeletionDialog: View {
    @EnvironmentObject private var store: TaskStore
    @Environment(\.palette) private var palette

    private var copy: (title: String, description: String, cancel: String, confirm: String) {
        switch store.confirmation {
        case .canvas:
            (
                "clear the whole canvas?",
                "This deletes every list and every task immediately. They will not move to history.",
                "keep everything",
                "clear canvas"
            )
        case .list:
            (
                "delete this list?",
                "This deletes the list and its tasks immediately. They will not move to history.",
                "keep list",
                "delete list"
            )
        default:
            (
                "clear task history?",
                "This removes every completed task from history. There is no undo for this action.",
                "keep history",
                "clear history"
            )
        }
    }

    var body: some View {
        VStack(spacing: 0) {
            HStack {
                Text(copy.title)
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
            Text(copy.description)
                .foregroundStyle(palette.muted)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(20)
            Rectangle().fill(palette.line).frame(height: 1)
            HStack(spacing: 0) {
                Button(copy.cancel) { store.confirmation = nil }
                    .buttonStyle(.plain)
                    .frame(maxWidth: .infinity, minHeight: 52)
                Rectangle().fill(palette.line).frame(width: 1)
                Button(copy.confirm) { store.confirmDeletion() }
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

struct Shortcut {
    let label: String
    let combos: [[String]]
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
                    Shortcut(label: "next task", combos: [["↓"]]),
                    Shortcut(label: "previous task", combos: [["↑"]]),
                    Shortcut(label: "new task below", combos: [["enter"]]),
                    Shortcut(label: "new task above", combos: [["shift", "enter"]]),
                    Shortcut(label: "unfocus task", combos: [["esc"]])
                ])
                shortcutSection("action", [
                    Shortcut(label: "complete task", combos: [["⌘", "enter"]]),
                    Shortcut(label: "move task up", combos: [["⌥", "↑"]]),
                    Shortcut(label: "move task down", combos: [["⌥", "↓"]])
                ])
                shortcutSection("canvas", [
                    Shortcut(label: "pan canvas", combos: [["drag"]]),
                    Shortcut(label: "zoom canvas", combos: [["pinch"]]),
                    Shortcut(label: "new list", combos: [["double-click"]]),
                    Shortcut(label: "move list", combos: [["drag control"]])
                ])
            }
            .padding(20)
        }
        .frame(width: 820)
        .fixedSize(horizontal: false, vertical: true)
        .background(.background)
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    private func shortcutSection(_ title: String, _ rows: [Shortcut]) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title).font(.custom("DM Sans", size: 18).weight(.medium))
            ForEach(rows, id: \.label) { row in
                HStack {
                    Text(row.label)
                    Spacer()
                    ShortcutKeys(combos: row.combos)
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
