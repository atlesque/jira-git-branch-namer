// Utility functions
const log = (...args) => console.log('[BranchHelper]', ...args);

// Container watcher to detect when the container appears in DOM
let lastFoundContainer = null;

const watchForContainer = () => {
    const observer = new MutationObserver(() => {
        const container = document.querySelector(SELECTORS.CONTAINER);
        
        // Only log if container is found and it's different from the last one
        if (container && container !== lastFoundContainer) {
            console.log('[BranchHelper] Container found in DOM');
            lastFoundContainer = container;
        }
        
        // Reset if container is no longer in DOM
        if (!container && lastFoundContainer) {
            lastFoundContainer = null;
        }
    });

    // Start observing DOM changes
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Also check immediately in case container is already present
    const container = document.querySelector(SELECTORS.CONTAINER);
    if (container) {
        console.log('[BranchHelper] Container found in DOM');
        lastFoundContainer = container;
    }
};

const getElement = (selector, parent = document) => {
    const element = parent.querySelector(selector);
    if (!element) {
        log(`Error: Element not found with selector: ${selector}`);
    }
    return element;
};

const getIssueType = () => {
    const issueTypeElement = getElement(SELECTORS.ISSUE_TYPE);
    if (!issueTypeElement) return null;
    
    const ariaLabel = issueTypeElement.getAttribute('aria-label') || '';
    return ariaLabel.includes('Bug') ? 'bug' : 'feature';
};

const extractBranchName = (gitCommand) => {
    const match = gitCommand.match(CONFIG.BRANCH_PATTERN);
    return match ? match[1] : null;
};

const generateBranchName = (originalBranch, issueType) => {
    const prefix = issueType === 'bug' ? CONFIG.PREFIXES.BUG : CONFIG.PREFIXES.FEATURE;
    return originalBranch.startsWith(prefix) ? originalBranch : `${prefix}${originalBranch}`;
};

const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        log('Error: Failed to copy to clipboard', err);
        return false;
    }
};

const updateInputValue = (input, value) => {
    input.value = value;
    input.select();
};

const createCustomCopyButton = (originalButton, finalCommand, input) => {
    const newButton = originalButton.cloneNode(true);
    originalButton.replaceWith(newButton);

    newButton.addEventListener('click', async () => {
        await copyToClipboard(finalCommand);
        
        // Restore our value after Jira resets it
        setTimeout(() => {
            updateInputValue(input, finalCommand);
        }, CONFIG.RESTORE_DELAY);
    });

    return newButton;
};

const setupCustomCopy = () => {
    const container = getElement(SELECTORS.CONTAINER);
    const button = getElement(SELECTORS.COPY_BUTTON);
    
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
    const branchName = extractBranchName(original);
    
    if (!branchName) {
        log('Error: No match for branch name in input');
        return;
    }

    const issueType = getIssueType();
    if (!issueType) {
        log('Error: Could not determine issue type');
        return;
    }

    const newBranch = generateBranchName(branchName, issueType);
    const finalCommand = `git checkout -b ${newBranch}`;

    createCustomCopyButton(button, finalCommand, input);

    updateInputValue(input, finalCommand);
};

const handleCreateBranchClick = (e) => {
    const btn = e.target.closest(SELECTORS.CREATE_BRANCH_DROPDOWN);
    if (btn) {
        setTimeout(setupCustomCopy, CONFIG.SETUP_DELAY);
    }
};

const initBranchHelper = () => {
    log('Initializing Branch Helper');
    document.addEventListener('click', handleCreateBranchClick);
    
    // Start watching for container when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', watchForContainer);
    } else {
        watchForContainer();
    }
};

initBranchHelper();