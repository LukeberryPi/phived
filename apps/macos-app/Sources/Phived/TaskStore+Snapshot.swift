import Foundation

extension TaskStore {
    func seedSnapshotStateIfRequested() -> Bool {
        guard let state = ProcessInfo.processInfo.environment["PHIVED_SNAPSHOT_STATE"] else {
            return false
        }

        lists = [Self.centeredList()]
        history = []
        viewport = CanvasViewport(x: -2410, y: -1620, zoom: 1)
        theme = .system
        helpOpen = true
        historyOpen = true

        switch state {
        case "populated":
            let first = Self.makeList(x: 2800, y: 1700, tag: "work", tasks: ["ship the native app", "compare every pixel"])
            let second = Self.makeList(x: 3200, y: 1800, tag: "personal", tasks: ["buy coffee"])
            lists = [first, second]
            history = [
                HistoryEntry(text: "build the monorepo", listId: first.id, listTag: first.tag),
                HistoryEntry(text: "move the web app", completedAt: Calendar.current.date(byAdding: .day, value: -1, to: Date())!, listId: first.id, listTag: first.tag)
            ]
        case "dialog":
            lists = [Self.centeredList(tasks: ["ship the native app"])]
            confirmation = .canvas
        case "light":
            theme = .light
        default:
            break
        }

        return true
    }
}
