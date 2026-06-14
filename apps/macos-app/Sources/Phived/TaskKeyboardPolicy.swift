enum TaskKeyboardPolicy {
    enum FreshRowDecision: Equatable {
        case focus(Int)
        case insert(at: Int, focus: Int)
    }

    static func arrowUpFocus(from index: Int, taskCount: Int) -> Int? {
        guard taskCount > 0, index >= 0, index < taskCount else { return nil }
        return index == 0 ? taskCount - 1 : index - 1
    }

    static func arrowDownFocus(from index: Int, taskCount: Int) -> Int? {
        guard taskCount > 0, index >= 0, index < taskCount else { return nil }
        return index == taskCount - 1 ? 0 : index + 1
    }

    static func freshRowDecision(tasks: [String], index: Int, above: Bool) -> FreshRowDecision? {
        guard tasks.indices.contains(index) else { return nil }

        let target = above ? index - 1 : index + 1
        if tasks.indices.contains(target), tasks[target].isBlank {
            return .focus(target)
        }

        let insertion = above ? index : index + 1
        return .insert(at: insertion, focus: insertion)
    }
}
