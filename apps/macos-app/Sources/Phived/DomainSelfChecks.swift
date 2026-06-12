import Foundation

@MainActor
enum DomainSelfChecks {
    static func run() {
        let suiteName = "phived-self-check-\(UUID())"
        let defaults = UserDefaults(suiteName: suiteName)!
        defer { defaults.removePersistentDomain(forName: suiteName) }

        let store = TaskStore(defaults: defaults)
        precondition(store.lists.count == 1)
        let listId = store.lists[0].id
        precondition(store.lists[0].tasks.count == TaskStore.minimumRows)

        store.updateTask(listId, index: 0, value: " Ship it ")
        store.complete(listId, index: 0)
        precondition(store.history.first?.text == "Ship it")
        precondition(store.lists[0].tasks == TaskStore.emptyTasks())

        print("Phived domain self-checks passed")
    }
}
