import XCTest
@testable import Phived

@MainActor
final class TaskStoreTests: XCTestCase {
    private var defaults: UserDefaults!

    override func setUp() {
        defaults = UserDefaults(suiteName: UUID().uuidString)!
    }

    func testCompletingMovesTaskToHistory() {
        let store = TaskStore(defaults: defaults)
        store.tasks[0] = " Ship it "
        store.complete(0)
        XCTAssertEqual(store.history.first?.text, "Ship it")
        XCTAssertEqual(store.tasks, TaskStore.emptyTasks())
    }

    func testRestoreUsesFirstEmptySlot() {
        let store = TaskStore(defaults: defaults)
        store.tasks = ["one", "", "three", "", "five"]
        let entry = HistoryEntry(id: UUID(), text: "two", completedAt: Date())
        store.history = [entry]
        store.restore(entry)
        XCTAssertEqual(store.tasks, ["one", "two", "three", "", "five"])
        XCTAssertTrue(store.history.isEmpty)
    }

    func testFullListCannotRestore() {
        let store = TaskStore(defaults: defaults)
        store.tasks = ["1", "2", "3", "4", "5"]
        let entry = HistoryEntry(id: UUID(), text: "six", completedAt: Date())
        store.history = [entry]
        store.restore(entry)
        XCTAssertEqual(store.history, [entry])
        XCTAssertTrue(store.toasts.last?.isError == true)
    }

    func testMoveReordersAllFiveSlots() {
        let store = TaskStore(defaults: defaults)
        store.tasks = ["one", "two", "three", "", ""]
        store.move(from: 0, to: 2)
        XCTAssertEqual(store.tasks, ["two", "three", "one", "", ""])
    }

    func testClearTasksRequiresAndAppliesConfirmation() {
        let store = TaskStore(defaults: defaults)
        store.tasks[0] = "one"
        store.requestClearTasks()
        XCTAssertEqual(store.confirmation, .tasks)
        store.confirmDeletion()
        XCTAssertEqual(store.tasks, TaskStore.emptyTasks())
        XCTAssertEqual(store.toasts.last?.text, "tasks cleared!")
    }

    func testThemeCyclesInWebOrder() {
        let store = TaskStore(defaults: defaults)
        XCTAssertEqual(store.theme, .system)
        store.cycleTheme()
        XCTAssertEqual(store.theme, .dark)
        store.cycleTheme()
        XCTAssertEqual(store.theme, .light)
        store.cycleTheme()
        XCTAssertEqual(store.theme, .system)
    }
}
