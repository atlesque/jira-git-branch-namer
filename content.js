const log = (...args) => console.log('[BranchHelper]', ...args);

const setupCustomCopy = () => {
    const container = document.querySelector('[data-testid="platform-copy-text-field.textfield---container"]');
    const button = document.querySelector('[data-testid="platform-copy-text-field.styled-button-"]');
    if (!container || !button) {
        log('Error: Container or button not found');
        return;
    }

    const input = container.querySelector('input');
    if (!input || !input.value) {
        log('Error: Input not found or empty');
        return;
    }

    const original = input.value.trim();
    const match = original.match(/git checkout -b (.+)/);
    if (!match) {
        log('Error: No match for branch name in input');
        return;
    }

    const branch = match[1];
    const issueType = document.querySelector('[data-testid="issue.issue-type.lozenge"]')?.innerText || '';
    const prefix = /bug/i.test(issueType) ? 'bugfix/' : 'feature/';
    const newBranch = branch.startsWith(prefix) ? branch : `${prefix}${branch}`;
    const finalCommand = `git checkout -b ${newBranch}`;

    // Replace the button to override the default click
    const newButton = button.cloneNode(true);
    button.replaceWith(newButton);

    newButton.addEventListener('click', () => {
        navigator.clipboard.writeText(finalCommand).then(() => {
            // Success - no logging needed
        }).catch(err => {
            log('Error: Failed to copy to clipboard', err);
        });

        // Restore our value after Jira resets it
        setTimeout(() => {
            input.value = finalCommand;
            input.select();
        }, 100);
    });

    // Set visible value initially
    input.value = finalCommand;
    input.select();
};

document.addEventListener('click', (e) => {
    const btn = e.target.closest('[aria-controls="create-branch-dropdown"]');
    if (btn) {
        setTimeout(setupCustomCopy, 300);
    }
});