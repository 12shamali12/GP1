"use client";

import Link from "next/link";
import type { ConversationItem, MessageItem } from "@/features/chat/types/chat";
import { useTranslation } from "@/features/i18n/language-provider";

type PatientChatWorkspaceProps = {
  apiUrl: string;
  userId?: string;
  chatSearch: string;
  chatResults: any[];
  conversations: ConversationItem[];
  selectedConversation: ConversationItem | null;
  chatMessages: MessageItem[];
  chatText: string;
  chatLoading: boolean;
  onSearchChange: (value: string) => void;
  onStartChatWith: (recipientIdentifier: string) => void;
  onOpenConversation: (conversation: ConversationItem) => void;
  onChatTextChange: (value: string) => void;
  onAttachImage: () => void;
  onSend: () => void;
};

export function PatientChatWorkspace({
  apiUrl,
  userId,
  chatSearch,
  chatResults,
  conversations,
  selectedConversation,
  chatMessages,
  chatText,
  chatLoading,
  onSearchChange,
  onStartChatWith,
  onOpenConversation,
  onChatTextChange,
  onAttachImage,
  onSend,
}: PatientChatWorkspaceProps) {
  const t = useTranslation();
  const isRoom = selectedConversation?.kind === "ROOM";
  const selectedTitle = isRoom
    ? selectedConversation?.title || t("patient.chat.shared_room")
    : selectedConversation?.otherUser?.name ||
      selectedConversation?.otherUser?.username ||
      t("patient.common.unknown");
  const selectedMeta = isRoom
    ? selectedConversation?.description ||
      (selectedConversation?.group
        ? `${selectedConversation.group.name} | ${
            selectedConversation.group.semesterLabel ||
            t("admin.chat.group_fallback")
          }`
        : t("patient.chat.shared_room"))
    : selectedConversation?.otherUser?.phone ||
      selectedConversation?.otherUser?.email ||
      selectedConversation?.otherUser?.username ||
      "";

  return (
    <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
      <div className="denty-dashboard-card overflow-hidden p-5">
        <p className="denty-kicker">{t("patient.chat.eyebrow")}</p>
        <h2 className="mt-3 text-xl font-semibold text-[var(--foreground)]">
          {t("patient.chat.title")}
        </h2>
        <input
          value={chatSearch}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t("patient.chat.search")}
          className="denty-field mt-5 text-sm"
        />

        <div className="mt-4 max-h-[36rem] space-y-3 overflow-y-auto pr-1">
          {chatResults.length > 0 ? (
            <div className="denty-dashboard-card-soft space-y-2 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                {t("patient.chat.search_results")}
              </p>
              {chatResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() =>
                    onStartChatWith(
                      result.id || result.email || result.phone || result.username,
                    )
                  }
                  className="denty-list-row flex w-full items-center gap-3 px-3 py-3 text-left"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(11,123,138,0.12)] text-sm font-bold text-[rgba(8,68,78,0.96)]">
                    {(result.name || result.username || "?").charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[var(--foreground)]">
                      {result.name || result.username}
                    </p>
                    <p className="truncate text-xs text-[var(--muted-foreground)]">
                      {result.phone || result.email || result.username}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : null}

          {conversations.map((conversation) => {
            const other = conversation.otherUser;
            const title =
              conversation.kind === "ROOM"
                ? conversation.title || t("patient.chat.shared_room")
                : other?.name || other?.username || t("patient.common.unknown");
            const meta =
              conversation.kind === "ROOM"
                ? conversation.description ||
                  (conversation.group
                    ? `${conversation.group.name} | ${
                        conversation.group.semesterLabel ||
                        t("admin.chat.group_fallback")
                      }`
                    : t("patient.chat.shared_room"))
                : conversation.lastMessage?.text ||
                  (conversation.lastMessage?.imageUrl
                    ? t("patient.chat.image")
                    : t("patient.chat.start_chatting"));

            return (
              <button
                key={conversation.id}
                onClick={() => onOpenConversation(conversation)}
                className="denty-list-row flex w-full items-center gap-3 px-3 py-3 text-left"
              >
                <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-[rgba(11,123,138,0.12)] text-base font-bold text-[rgba(8,68,78,0.96)]">
                  {conversation.kind === "ROOM" ? (
                    "#"
                  ) : other?.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={other.avatar}
                      alt={other.name || "user"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    (other?.name || other?.username || "U").charAt(0).toUpperCase()
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[var(--foreground)]">{title}</p>
                    {conversation.kind === "ROOM" ? (
                      <span className="rounded-full border border-white/12 bg-white/22 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[rgba(10,22,40,0.56)]">
                        {t("patient.common.room")}
                      </span>
                    ) : null}
                  </div>
                  <p className="truncate text-xs text-[var(--muted-foreground)]">
                    {meta}
                  </p>
                </div>
                {conversation.unread > 0 ? (
                  <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[var(--color-danger)] px-1 text-[11px] font-bold text-white">
                    {Math.min(9, conversation.unread)}
                    {conversation.unread > 9 ? "+" : ""}
                  </span>
                ) : null}
              </button>
            );
          })}

          {conversations.length === 0 && chatResults.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)]">
              {t("patient.chat.empty")}
            </p>
          ) : null}
        </div>
      </div>

      <div className="denty-dashboard-card overflow-hidden p-5">
        {selectedConversation ? (
          <>
            <div className="flex items-center justify-between gap-4 border-b border-[rgba(148,163,184,0.14)] pb-4">
              {isRoom ? (
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[rgba(11,123,138,0.12)] text-base font-bold text-[rgba(8,68,78,0.96)]">
                    #
                  </span>
                  <div>
                    <p className="text-lg font-semibold text-[var(--foreground)]">
                      {selectedTitle}
                    </p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {selectedMeta}
                    </p>
                  </div>
                </div>
              ) : selectedConversation.otherUser?.id ? (
                <Link
                  href={`/profiles/${selectedConversation.otherUser.id}`}
                  className="flex items-center gap-3"
                >
                  <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[rgba(11,123,138,0.12)] text-base font-bold text-[rgba(8,68,78,0.96)]">
                    {selectedConversation.otherUser?.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={selectedConversation.otherUser.avatar}
                        alt={selectedConversation.otherUser?.name || "user"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      (
                        selectedConversation.otherUser?.name ||
                        selectedConversation.otherUser?.username ||
                        "U"
                      )
                        .charAt(0)
                        .toUpperCase()
                    )}
                  </span>
                  <div>
                    <p className="text-lg font-semibold text-[var(--foreground)] hover:text-[rgba(7,111,133,0.96)]">
                      {selectedTitle}
                    </p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {selectedMeta}
                    </p>
                  </div>
                </Link>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[rgba(11,123,138,0.12)] text-base font-bold text-[rgba(8,68,78,0.96)]">
                    {(
                      selectedConversation.otherUser?.name ||
                      selectedConversation.otherUser?.username ||
                      "U"
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                  <div>
                    <p className="text-lg font-semibold text-[var(--foreground)]">
                      {selectedTitle}
                    </p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {selectedMeta}
                    </p>
                  </div>
                </div>
              )}

              {!isRoom && selectedConversation.otherUser?.id ? (
                <Link
                  href={`/profiles/${selectedConversation.otherUser.id}`}
                  className="denty-pill hover:bg-white/36"
                >
                  {t("patient.common.profile")}
                </Link>
              ) : (
                <span className="denty-pill">{t("patient.common.room")}</span>
              )}
            </div>

            <div className="mt-4 flex h-[31rem] flex-col">
              <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                {chatMessages.map((message, index) => {
                  const mine = message.senderId && userId && message.senderId === userId;
                  const showSender =
                    index === 0 ||
                    chatMessages[index - 1].sender.username !== message.sender.username;
                  return (
                    <div
                      key={`${message.id || index}-${index}`}
                      className={`denty-bubble ${
                        mine ? "denty-bubble-mine" : "denty-bubble-other"
                      }`}
                    >
                      {!mine && showSender ? (
                        <div className="mb-2">
                          <Link
                            href={`/profiles/${message.sender.id}`}
                            className="text-xs font-semibold uppercase tracking-[0.14em] text-[rgba(10,22,40,0.52)] hover:text-[var(--foreground)]"
                          >
                            {message.sender.name}
                          </Link>
                        </div>
                      ) : null}
                      {message.text ? <p className="text-sm">{message.text}</p> : null}
                      {message.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`${apiUrl}${message.imageUrl}`}
                          alt="attachment"
                          className="mt-2 max-h-56 rounded-lg border border-slate-600/70 object-cover"
                        />
                      ) : null}
                      <p className="mt-2 text-[10px] text-sky-100/80">
                        {new Date(message.createdAt || Date.now()).toLocaleString()}
                      </p>
                    </div>
                  );
                })}

                {chatMessages.length === 0 ? (
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {t("patient.chat.no_messages")}
                  </p>
                ) : null}
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button onClick={onAttachImage} className="denty-action denty-action-secondary px-4 py-3">
                  {t("patient.common.attach")}
                </button>
                <input
                  value={chatText}
                  onChange={(event) => onChatTextChange(event.target.value)}
                  placeholder={
                    isRoom
                      ? t("patient.chat.write_room")
                      : t("patient.chat.type_message")
                  }
                  className="denty-field flex-1 text-sm"
                />
                <button
                  onClick={onSend}
                  disabled={chatLoading}
                  className="denty-button-primary px-5 py-3 text-sm disabled:opacity-60"
                >
                  {t("patient.common.send")}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-[40rem] flex-col items-center justify-center text-center text-[var(--muted-foreground)]">
            <p className="text-xl font-semibold text-[var(--foreground)]">
              {t("patient.chat.select_title")}
            </p>
            <p className="mt-3 max-w-xl text-sm leading-7">
              {t("patient.chat.select_body")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
