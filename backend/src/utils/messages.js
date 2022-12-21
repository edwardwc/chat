export const updateMessage = (message) => { // sender system
    return JSON.stringify({
        Sender: "update",
        Message: message,
        Timestamp: Date.now()
    })
}

export const systemMessage = (message) => { // sender system
    return JSON.stringify({
        Sender: "system",
        Message: message,
        Timestamp: Date.now()
    })
}

export const regularMessage = (name, message) => { // sender anyone else
    return JSON.stringify({
        Sender: name,
        Message: message,
        Timestamp: Date.now() // ms since epoch
    })
}