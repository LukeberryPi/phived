import XCTest
@testable import Phived

@MainActor
final class TaskStoreTests: XCTestCase {
    private var defaults: UserDefaults!

    override func setUp() {
        defaults = UserDefaults(suiteName: UUID().uuidString)!
    }

    func testStartsWithCenteredFiveRowList() {
        let store = TaskStore(defaults: defaults)
        XCTAssertEqual(store.lists.count, 1)
        XCTAssertEqual(store.lists[0].tasks, TaskStore.emptyTasks())
        XCTAssertEqual(store.lists[0].width, TaskStore.defaultListWidth)
    }

    func testMigratesLegacyGeneralTasks() throws {
        defaults.set(try JSONEncoder().encode(["one", "two", "", "", ""]), forKey: "storedGeneralTasks")
        let store = TaskStore(defaults: defaults)
        XCTAssertEqual(Array(store.lists[0].tasks.prefix(2)), ["one", "two"])
    }

    func testCompletingMovesTaskToHistoryWithListProvenance() {
        let store = TaskStore(defaults: defaults)
        let id = store.lists[0].id
        store.updateTag(id, "work")
        store.updateTask(id, index: 0, value: " Ship it ")
        store.complete(id, index: 0)
        XCTAssertEqual(store.history.first?.text, "Ship it")
        XCTAssertEqual(store.history.first?.listId, id)
        XCTAssertEqual(store.history.first?.listTag, "work")
        XCTAssertEqual(store.lists[0].tasks, TaskStore.emptyTasks())
    }

    func testRestoreTargetsOriginalListAndCreatesTrailingRow() {
        let store = TaskStore(defaults: defaults)
        let id = store.lists[0].id
        store.lists[0].tasks = ["1", "2", "3", "4", "5"]
        let entry = HistoryEntry(text: "six", listId: id)
        store.history = [entry]
        store.restore(entry)
        XCTAssertEqual(store.lists[0].tasks, ["1", "2", "3", "4", "5", "six", ""])
        XCTAssertTrue(store.history.isEmpty)
    }

    func testRestoreFallsBackToFirstList() {
        let store = TaskStore(defaults: defaults)
        let entry = HistoryEntry(text: "restored", listId: UUID())
        store.history = [entry]
        store.restore(entry)
        XCTAssertEqual(store.lists[0].tasks[0], "restored")
    }

    func testRowsInsertRemoveAndReorder() {
        let store = TaskStore(defaults: defaults)
        let id = store.lists[0].id
        store.updateTask(id, index: 0, value: "one")
        store.insertRow(id, at: 1)
        XCTAssertEqual(store.lists[0].tasks.count, 6)
        store.removeEmptyExtraRow(id, index: 1)
        XCTAssertEqual(store.lists[0].tasks.count, 5)
        store.updateTask(id, index: 1, value: "two")
        store.reorderTask(id, from: 0, to: 1)
        XCTAssertEqual(Array(store.lists[0].tasks.prefix(2)), ["two", "one"])
    }

    func testListMoveResizeAndStackingAreClamped() {
        let store = TaskStore(defaults: defaults)
        let first = store.lists[0].id
        let second = store.addList(x: 100, y: 100)
        store.moveList(first, x: -100, y: 10_000)
        store.resizeList(first, width: 10_000)
        store.bringToFront(first)
        XCTAssertEqual(store.lists.last?.id, first)
        XCTAssertEqual(store.lists.first?.id, second)
        XCTAssertEqual(store.lists.last?.x, 16)
        XCTAssertEqual(store.lists.last?.y, TaskStore.canvasHeight - 376)
        XCTAssertEqual(store.lists.last?.width, TaskStore.maximumListWidth)
    }

    func testEmptyListDeletesImmediatelyAndFilledListConfirms() {
        let store = TaskStore(defaults: defaults)
        let emptyId = store.addList(x: 100, y: 100)
        store.requestDeleteList(emptyId)
        XCTAssertFalse(store.lists.contains { $0.id == emptyId })

        let filledId = store.lists[0].id
        store.updateTask(filledId, index: 0, value: "keep")
        store.requestDeleteList(filledId)
        XCTAssertEqual(store.confirmation, .list(filledId))
        store.confirmDeletion()
        XCTAssertFalse(store.lists.contains { $0.id == filledId })
    }

    func testClearCanvasLeavesOneEmptyCenteredList() {
        let store = TaskStore(defaults: defaults)
        let id = store.lists[0].id
        store.updateTask(id, index: 0, value: "one")
        _ = store.addList(x: 100, y: 100)
        store.requestClearCanvas()
        XCTAssertEqual(store.confirmation, .canvas)
        store.confirmDeletion()
        XCTAssertEqual(store.lists.count, 1)
        XCTAssertEqual(store.lists[0].tasks, TaskStore.emptyTasks())
        XCTAssertEqual(store.toasts.last?.text, "canvas cleared!")
    }

    func testViewportZoomAndListWidthClamp() {
        let store = TaskStore(defaults: defaults)
        store.setViewport(CanvasViewport(x: 12, y: 34, zoom: 100))
        XCTAssertEqual(store.viewport, CanvasViewport(x: 12, y: 34, zoom: TaskStore.maximumZoom))
        store.setViewport(CanvasViewport(x: 12, y: 34, zoom: 0))
        XCTAssertEqual(store.viewport.zoom, TaskStore.minimumZoom)
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
