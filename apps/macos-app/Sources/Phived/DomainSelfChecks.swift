import Foundation

@MainActor
enum DomainSelfChecks {
    static func run() {
        let suiteName = "phived-self-check-\(UUID())"
        let defaults = UserDefaults(suiteName: suiteName)!
        defer { defaults.removePersistentDomain(forName: suiteName) }

        let store = TaskStore(defaults: defaults)
        store.tasks[0] = " Ship it "
        store.complete(0)
        precondition(store.history.first?.text == "Ship it")
        precondition(store.tasks == TaskStore.emptyTasks())

        let entry = HistoryEntry(id: UUID(), text: "restore me", completedAt: Date())
        store.tasks = ["one", "", "three", "", "five"]
        store.history = [entry]
        store.restore(entry)
        precondition(store.tasks == ["one", "restore me", "three", "", "five"])
        precondition(store.history.isEmpty)

        store.tasks = ["1", "2", "3", "4", "5"]
        store.history = [entry]
        store.restore(entry)
        precondition(store.history == [entry])
        precondition(store.toasts.last?.isError == true)

        store.move(from: 0, to: 2)
        precondition(store.tasks == ["2", "3", "1", "4", "5"])

        precondition(store.theme == .system)
        store.cycleTheme()
        precondition(store.theme == .dark)
        store.cycleTheme()
        precondition(store.theme == .light)
        store.cycleTheme()
        precondition(store.theme == .system)

        print("Phived domain self-checks passed")
    }
}
