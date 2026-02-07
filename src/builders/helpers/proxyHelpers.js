function defaultGetName(item) {
    return item?.name || item?.tag || '';
}

function defaultSetName(item, name) {
    if (item) {
        if ('name' in item) {
            item.name = name;
        } else if ('tag' in item) {
            item.tag = name;
        }
    }
}

function defaultIsSame(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
}

export function addProxyWithDedup(collection, proxy, { getName = defaultGetName, setName = defaultSetName, isSame = defaultIsSame } = {}) {
    if (!proxy) return;
    if (!Array.isArray(collection)) {
        throw new Error('addProxyWithDedup expects the target collection to be an array');
    }

    let candidate = proxy;
    const targetName = getName(candidate) || '';

    const hasIdentical = collection.some(item => isSame(item, candidate));
    if (hasIdentical) {
        return;
    }

    // Check for exact name conflicts (not substring matches)
    if (targetName && typeof setName === 'function') {
        const existingNames = new Set(collection.map(item => getName(item) || ''));
        if (existingNames.has(targetName)) {
            // Find the next available suffix
            let suffix = 2;
            while (existingNames.has(`${targetName} ${suffix}`)) {
                suffix++;
            }
            const updated = setName(candidate, `${targetName} ${suffix}`);
            if (typeof updated !== 'undefined') {
                candidate = updated;
            }
        }
    }

    collection.push(candidate);
}
