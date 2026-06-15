import SwiftUI

struct DrawersView: View {
    @EnvironmentObject private var store: TaskStore

    var body: some View {
        VStack {
            Spacer()
            HStack(alignment: .bottom) {
                Drawer(open: $store.helpOpen, closedLabel: "show help", openLabel: "hide help", icon: "question") {
                    HelpView()
                }
                Spacer()
                Drawer(
                    open: $store.historyOpen,
                    closedLabel: "show history",
                    openLabel: "hide history",
                    icon: "clock",
                    badge: store.history.count,
                    onClear: store.history.isEmpty ? nil : { store.confirmation = .history }
                ) {
                    HistoryView()
                }
            }
            .padding(24)
        }
    }
}

struct Drawer<Content: View>: View {
    @Environment(\.palette) private var palette
    @Binding var open: Bool
    let closedLabel: String
    let openLabel: String
    let icon: String
    var badge = 0
    var onClear: (() -> Void)?
    @ViewBuilder let content: () -> Content

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
                        if badge > 0 {
                            Text("\(badge)")
                                .font(.caption)
                                .frame(width: 24, height: 24)
                                .background(palette.accent)
                                .clipShape(Circle())
                        }
                    }
                    .padding(.horizontal, 16).frame(height: 48)
                }
                .buttonStyle(.plain)
                .frame(maxWidth: open ? .infinity : nil, alignment: .leading)
                if open, let onClear {
                    Rectangle().fill(palette.line).frame(width: 1)
                    Button(action: onClear) {
                        PhivedIcon(name: "trash")
                            .frame(width: 48, height: 48)
                    }
                    .buttonStyle(.plain)
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
            Text("Your tasks live on a canvas now. Spawn as many lists as you need and give each one a tag, like **work** or **personal**.")
            Text("**Double-click** anywhere on the canvas (or press **new list**) to spawn a list. Use its move control to position it.")
            Text("Drag the canvas to pan and pinch to zoom. Lists grow as you type, and finished tasks move to history when you press **done**.")
            Text("No login. No ads. No distractions.")
            HStack(spacing: 4) {
                Link("Open Source", destination: URL(string: "https://github.com/lukeberrypi/phived")!).underline()
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
    @Environment(\.palette) private var palette

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
    @Environment(\.palette) private var palette
    @State private var hovering = false
    let entry: HistoryEntry

    var body: some View {
        HStack(spacing: 12) {
            Text(entry.text)
                .font(.custom("DM Sans", size: 14).weight(.medium))
                .lineLimit(1)
            if let tag = entry.listTag {
                Text(tag)
                    .font(.custom("DM Sans", size: 11))
                    .foregroundStyle(palette.muted)
                    .padding(.horizontal, 7)
                    .padding(.vertical, 2)
                    .overlay { Capsule().stroke(palette.line) }
                    .lineLimit(1)
            }
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

private func historyWhen(_ date: Date) -> String {
    let days = Calendar.current.dateComponents(
        [.day],
        from: Calendar.current.startOfDay(for: date),
        to: Calendar.current.startOfDay(for: Date())
    ).day ?? 0
    switch days {
    case 0: return "earlier today"
    case 1: return "yesterday"
    case 2...6: return "a few days ago"
    default: return "over a week ago"
    }
}
