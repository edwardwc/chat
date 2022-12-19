const broadcastMessage = async (room, message, sender) => {
    // need to check that the user is in this room as well (soon tm)
    await internalSendMessage(room, JSON.stringify({
        sender,
        message
    }))

}

const broadcastSystem = async (room, message) => {
    await internalSendMessage(room, JSON.stringify({
        sender: "System",
        message
    }))
}

const internalSendMessage = async (room, msg) => {
}