export const eChatMsgType = {
    Error: 0,
    Info: 1,
    Notice: 2,
    Normal: 3,
    Emoji: 3,
};

export const eProtocolId = {
    CS_CHAT_PING: 30000,
    CS_CHAT_ADDRESS: 30001,
    CS_CHAT_SERVER: 30002,

    CS_CHAT_CONNECT: 30101,
    CS_CHAT_SEND: 30201,
    CS_CHAT_USER: 30202,
    CS_CHAT_OUT: 30203,
    CS_CHAT_NOTICE: 30206,
    CS_CHAT_USERLIST: 30207,
    CS_CHAT_FRIENDLIST: 30208,
    CS_CHAT_CHANNEL: 30209,

    PC_CHAT_JOIN: 30401,
    PC_CHAT_OUT: 30402,
    PC_CHAT_NOTICE: 30403,
    PC_CHAT_SEND: 30404,
};

export const eResultCode = {
    SUCCESS: 1,
    AUTH_ERROR: 401,
    SOCKET_DATA_NOT_FOUND: 402,
    AUTH_NOT_FOUND: 403,
    USER_NOT_FOUND: 404,
};
