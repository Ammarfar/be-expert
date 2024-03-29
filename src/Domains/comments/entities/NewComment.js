class NewComment {
  constructor(payload) {
    this._verifyPayload(payload);

    this.content = payload.content;
    this.thread_id = payload.thread_id;
    this.owner = payload.owner;
  }

  _verifyPayload(payload) {
    const { content, thread_id, owner } = payload;

    if (!content || !thread_id || !owner) {
      throw new Error("NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY");
    }

    if (
      typeof content !== "string" ||
      typeof thread_id !== "string" ||
      typeof owner !== "string"
    ) {
      throw new Error("NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION");
    }
  }
}

module.exports = NewComment;
