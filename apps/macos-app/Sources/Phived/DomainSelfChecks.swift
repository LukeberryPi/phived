import Foundation

/// A lightweight boot smoke test for the shipped binary, run via `PHIVED_SELF_TEST=1`.
/// It verifies the store wires up against real `UserDefaults` and that a single
/// complete flows end to end. Exhaustive domain coverage lives in `TaskStoreTests`.
@MainActor
enum DomainSelfChecks {
    static func run() {
        let suiteName = "phived-self-check-\(UUID())"
        let defaults = UserDefaults(suiteName: suiteName)!
        defer { defaults.removePersistentDomain(forName: suiteName) }

        let store = TaskStore(defaults: defaults)
        precondition(store.tasks.count == TaskStore.taskCount)

        store.tasks[0] = " Ship it "
        store.complete(0)
        precondition(store.history.first?.text == "Ship it")
        precondition(store.tasks == TaskStore.emptyTasks())

        print("Phived domain self-checks passed")
    }
}
