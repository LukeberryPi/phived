import SwiftUI

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

struct ToastView: View {
    @Environment(\.palette) private var palette
    let message: TaskStore.ToastMessage

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
