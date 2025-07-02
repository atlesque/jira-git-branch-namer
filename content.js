const waitForPopover = () => {
    const container = document.querySelector('[data-testid="platform-copy-text-field.textfield---container"]');

    if (container) {
        const input = container.querySelector('input');
        if (!input || !input.value) return;

        const original = input.value.trim();
        const match = original.match(/git checkout -b (.+)/);
        if (!match) return;

        const branch = match[1];
        const issueType = document.querySelector('[data-testid="issue.issue-type.lozenge"]')?.innerText || '';
        const prefix = /bug/i.test(issueType) ? 'bugfix/' : 'feature/';
        const newBranch = branch.startsWith(prefix) ? branch : `${prefix}${branch}`;

        input.value = `git checkout -b ${newBranch}`;
        input.select();
    } else {
        setTimeout(waitForPopover, 300);
    }
};

document.addEventListener('click', (e) => {
    const btn = e.target.closest('[aria-controls="create-branch-dropdown"]');
    if (btn) {
        setTimeout(waitForPopover, 300);
    }
});