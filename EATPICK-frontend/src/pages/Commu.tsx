import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import "../assets/css/Community.css";
import "../assets/css/Commu.css";
import {
  communityService,
  type Post,
  type BoardCategory,
} from "../services/communityService";

const BOARD_GROUPS = [
  {
    groupName: "채식 게시판",
    boards: [
      { name: "채식맛집", slug: "cate-veg-main", label: "방문후기" },
      { name: "채식 자유", slug: "cate-veg-free", label: "자유게시판" },
    ],
  },
  {
    groupName: "주류 게시판",
    boards: [
      { name: "주류매장", slug: "cate-alc-main", label: "방문후기" },
      { name: "주류 자유", slug: "cate-alc-free", label: "자유게시판" },
    ],
  },
  {
    groupName: "이국 게시판",
    boards: [
      { name: "이국맛집", slug: "cate-exp-main", label: "방문후기" },
      { name: "이국 자유", slug: "cate-exp-free", label: "자유게시판" },
    ],
  },
  {
    groupName: "괴식 게시판",
    boards: [
      { name: "괴식맛집", slug: "cate-weird-main", label: "방문후기" },
      { name: "괴식 자유", slug: "cate-weird-free", label: "자유게시판" },
    ],
  },
  {
    groupName: "유명셰프 게시판",
    boards: [
      { name: "유명셰프맛집", slug: "cate-chef-main", label: "방문후기" },
      { name: "유명셰프 자유", slug: "cate-chef-free", label: "자유게시판" },
    ],
  },
  {
    groupName: "미슐랭 게시판",
    boards: [
      { name: "미슐랭", slug: "cate-star-main", label: "방문후기" },
      { name: "미슐랭 자유", slug: "cate-star-free", label: "자유게시판" },
    ],
  },
  {
    groupName: "키즈존 게시판",
    boards: [
      { name: "키즈존", slug: "cate-kids-main", label: "방문후기" },
      { name: "키즈존 자유", slug: "cate-kids-free", label: "자유게시판" },
    ],
  },
  {
    groupName: "동물식당 게시판",
    boards: [
      { name: "동물식당", slug: "cate-pet-main", label: "방문후기" },
      { name: "동물식당 자유", slug: "cate-pet-free", label: "자유게시판" },
    ],
  },
];

export default function Commu() {
  const authContext = useContext(AuthContext);
  const currentUser = authContext ? authContext.user : null;

  // ─── 상태 관리 ───
  const [threadsData, setThreadsData] = useState<Post[]>([]);
  const [boardCategories, setBoardCategories] = useState<BoardCategory[]>([]);
  const [currentActiveBoard, setCurrentActiveBoard] =
    useState<string>("채식맛집");
  const [currentBoardId, setCurrentBoardId] = useState<number | null>(null);
  const [currentActiveCategory, setCurrentActiveCategory] =
    useState<string>("전체");
  const [currentWrapperId, setCurrentWrapperId] =
    useState<string>("cate-veg-main");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const postsPerPage = 5;

  const [writer, setWriter] = useState<string>("");
  const [quoteId, setQuoteId] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [imgUrl, setImgUrl] = useState<string>("");
  // 좋아요 계정당 1개 프론트 간이 방어
  const [likedPosts, setLikedPosts] = useState<{ [key: number]: boolean }>(() => {
  const saved = localStorage.getItem("likedPosts");
  return saved ? JSON.parse(saved) : {};
});
  const [expandedReplies, setExpandedReplies] = useState<{
    [key: number]: boolean;
  }>({});
  const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>(
    {},
  );

  // 2. 상태 변경 시 localStorage 저장 (좋아요 간이 방어)
useEffect(() => {
  localStorage.setItem("likedPosts", JSON.stringify(likedPosts));
}, [likedPosts]);

  useEffect(() => {
    if (currentUser?.nickname) {
      // 1. 로그인한 계정의 닉네임이 있으면 그걸 사용합니다.
      setWriter(currentUser.nickname);
    } else {
      // 2. 만약 닉네임이 없다면 '미식가_A'를 사용합니다.
      setWriter("미식가_A");
    }
  }, [currentUser]);

  // ─── 특정 게시판의 스레드 목록 및 답글 조회 ───
  const loadPosts = async (boardId: number) => {
    try {
      // 1. 원문 조회
      const data = await communityService.getPosts(
        boardId,
        currentPage - 1,
        postsPerPage,
      );
      const mainPosts = data.content;

      // 2. 답글 조회 (각 원문의 postId를 사용)
      const repliesPromises = mainPosts.map(async (post) => {
        try {
          const replies = await communityService.getReplies(post.postId);
          return replies;
        } catch (err) {
          return [];
        }
      });

      const repliesResults = await Promise.all(repliesPromises);
      const allReplies = repliesResults.flat();

      // 3. 상태 업데이트
      setThreadsData([...mainPosts, ...allReplies]);
      console.log(
        "로딩 완료 - 원문:",
        mainPosts.length,
        "답글:",
        allReplies.length,
      );
    } catch (error) {
      console.error("게시글 로드 실패:", error);
    }
  };

  // 2. 초기 데이터 로드 (독립적인 useEffect)
  useEffect(() => {
    const init = async () => {
      try {
        const boards = await communityService.getBoardCategories();
        console.log("받아온 게시판 데이터:", boards); // 데이터가 오는지 콘솔로 확인!
        setBoardCategories(boards);

        if (boards.length > 0) {
          // 첫 번째 게시판을 기본으로 설정
          setCurrentActiveBoard(boards[0].name);
          setCurrentBoardId(boards[0].boardId);
          setCurrentWrapperId(boards[0].slug); // wrapperId도 반드시 설정해야 함!
          loadPosts(boards[0].boardId);
        }
      } catch (e) {
        console.error("게시판 로드 실패:", e);
      }
    };
    init();
  }, []);

  // ─── 내비게이션 핸들러 ─────────────
  const handleSelectBoard = (boardName: string, slug: string) => {
    const targetBoard = boardCategories.find((b) => b.name === boardName);

    if (targetBoard) {
      setCurrentActiveBoard(boardName);
      setCurrentBoardId(targetBoard.boardId);
      setCurrentWrapperId(slug);
      setCurrentActiveCategory("전체");
      setCurrentPage(1);

      loadPosts(targetBoard.boardId);
    } else {
      alert(`[${boardName}] 게시판 정보를 찾을 수 없습니다.`);
    }
  };

  const handleSelectCategory = async (
    categoryName: string,
    isPending: boolean,
  ) => {
    if (isPending) {
      alert("관리자의 승인을 기다리고 있는 카테고리입니다.");
      return;
    }
    setCurrentActiveCategory(categoryName);
    setCurrentPage(1);
  };
  const handleSelectQuote = (postId: number) => {
    setQuoteId(String(postId));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ─── 3. 새 스레드 원문 게시글 등록 (POST /api/community/posts) ───
  const handleAddPost = async () => {
    if (!content.trim()) return alert("내용을 입력해 주세요!");
    if (!currentBoardId) return alert("게시판을 먼저 선택해 주세요.");

    const finalAuthor = isAnonymous
      ? "익명"
      : writer.trim() || currentUser?.nickname || "익명회원";

    const postPayload = {
      boardId: currentBoardId,
      parentId: null,
      quoteId: quoteId ? parseInt(quoteId) : null,
      writer: finalAuthor,
      content: content,
      isAnonymous: isAnonymous,
      imgUrl: imgUrl.trim(),
      thumbUrl: "",
    };

    try {
      const savedPost = await communityService.createPost({
        boardId: postPayload.boardId,
        parentId: postPayload.parentId,
        quoteId: postPayload.quoteId,
        writer: postPayload.writer,
        content: postPayload.content,
        isAnonymous: postPayload.isAnonymous,
        imgUrl: postPayload.imgUrl,
        thumbUrl: postPayload.thumbUrl,
      });

      setThreadsData((prev) => [savedPost, ...prev]);
      setCurrentPage(1);
      setContent("");
      setImgUrl("");
      setQuoteId("");
    } catch (error) {
      console.error("게시글 등록 실패:", error);
      alert("게시글 등록에 실패했습니다.");
    }
  };

  // ─── 4. 답글 추가 (POST /api/community/posts) ───
  const handleAddComment = async (postId: number) => {
    const commentText = commentInputs[postId]?.trim();
    if (!commentText) return alert("댓글 내용을 입력해 주세요!");
    if (!currentBoardId) return alert("게시판을 확인할 수 없습니다.");

    const finalCommentAuthor = isAnonymous
      ? "익명"
      : writer.trim() || currentUser?.nickname || "익명러";

    const commentPayload = {
      boardId: currentBoardId,
      parentId: postId, // 원문의 ID를 부모로 지정
      quoteId: null,
      writer: finalCommentAuthor,
      content: commentText,
      isAnonymous: isAnonymous,
      imgUrl: "",
      thumbUrl: "",
    };

    try {
      const newReply = await communityService.createPost(commentPayload);
      setThreadsData((prev) => [...prev, newReply]);
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
    } catch (e) {
      alert("댓글 등록 실패");
    }
  };

  // ─── 5. 삭제 ───
  const handleDeletePost = async (postId: number) => {
    if (!window.confirm("삭제하시겠습니까? 답글도 함께 삭제됩니다.")) return;

    try {
      // 1. 서버 삭제 요청
      await communityService.deletePost(postId);

      // 2. 로컬 상태 업데이트
      // 원문(postId)과 그 원문을 부모로 가진 모든 답글(parentId === postId)을 제거
      setThreadsData((prev) =>
        prev.filter(
          (post) => post.postId !== postId && post.parentId !== postId,
        ),
      );

      alert("삭제되었습니다.");
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("삭제에 실패했습니다.");
    }
  };

  // ─── 6. 좋아요 토글 ───
 const handleToggleLike = async (postId: number) => {
  // 좋아요 간이 방어
  const isAlreadyLiked = likedPosts[postId] || false;
  if (isAlreadyLiked) {
    alert("이미 좋아요를 누르셨습니다.");
    return;
  }

  try {
    // 서버 호출 (증가 모드)
    const updatedPost = await communityService.toggleLike(postId, true);
    
    // 로컬 상태 업데이트
    setLikedPosts(prev => ({ ...prev, [postId]: true }));
    
    // 화면 갱신
    setThreadsData(prev => prev.map(p => p.postId === postId ? updatedPost : p));
  } catch (error) {
    console.error("좋아요 실패:", error);
    alert("좋아요 처리에 실패했습니다.");
  }
};

  // ─── 데이터 필터링 및 페이지네이션 연산 ───
  const mainThreads = threadsData.filter(
    (post) => post.parentId === null || post.parentId === 0,
  );

  const filteredPosts = mainThreads.filter((post) => {
    const isBoardMatch = post.boardId === currentBoardId;
    const isCategoryMatch =
      currentActiveCategory === "전체"
        ? true
        : post.category === currentActiveCategory;
    return isBoardMatch && isCategoryMatch;
  });

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const paginatedPosts = filteredPosts.slice(
    startIndex,
    startIndex + postsPerPage,
  );

  return (
    <>
      <header className="cs-header">
        <div className="header-content">
          <h2 className="logo">
            <span>Eat Pick</span> 커뮤니티
          </h2>
          <div className="welcome-box">
            <h3>안녕하세요, Eat Pick 회원여러분!</h3>
            <h3>즐거운 시간되세요.</h3>
          </div>
        </div>
      </header>

      <div className="community-main-layout">
        <aside className="board-navigation-sidebar">
          <div className="sidebar-title">Eat Pick 커뮤니티</div>

          {BOARD_GROUPS.map((group) => (
            <div className="major-board-group" key={group.groupName}>
              <div className="major-title">{group.groupName}</div>
              <ul className="minor-board-list">
                {group.boards.map((configBoard) => {
                  const dbData = boardCategories.find(
                    (b) => b.name === configBoard.name,
                  );

                  return (
                    <div key={configBoard.name}>
                      <li
                        className={`minor-item ${currentActiveBoard === configBoard.name ? "active" : ""}`}
                        onClick={() =>
                          handleSelectBoard(configBoard.name, configBoard.slug)
                        }
                      >
                        {configBoard.label}
                      </li>

                      {/* 현재 선택된 게시판일 때만 카테고리 칩 노출 */}
                      {currentWrapperId === configBoard.slug && dbData && (
                        <div className="category-chip-wrapper">
                          {dbData.categories?.map((cate) => (
                            <span
                              key={cate}
                              className={`category-chip ${currentActiveCategory === cate ? "active" : ""}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectCategory(cate, false);
                              }}
                            >
                              # {cate}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </ul>
            </div>
          ))}
        </aside>

        <div className="threads-container">
          <div className="threads-header">
            {currentActiveBoard} ➔ {currentActiveCategory} 목록
          </div>

          <div className="write-card">
            <div className="write-layout">
              <div className="user-avatar">
                {isAnonymous
                  ? "익"
                  : writer.substring(0, 1).toUpperCase() || "U"}
              </div>
              <div className="write-inputs">
                <div className="author-row">
                  <input
                    type="text"
                    className="input-author"
                    placeholder="작성자 이름"
                    value={writer}
                    onChange={(e) => setWriter(e.target.value)}
                    disabled={isAnonymous}
                  />
                  {quoteId && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <input
                        type="text"
                        className="input-author"
                        style={{
                          width: "80px",
                          fontSize: "12px",
                          textAlign: "center",
                          backgroundColor: "#e9ecef",
                        }}
                        value={`ID: ${quoteId}`}
                        readOnly
                      />
                      <button
                        type="button"
                        className="cancel-quote-btn"
                        onClick={() => setQuoteId("")}
                      >
                        ❌ 취소
                      </button>
                    </div>
                  )}
                </div>
                <textarea
                  className="input-text"
                  placeholder="이야기를 함께 나누어보세요."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />

                <div className="write-options">
                  <div className="option-left">
                    <label>
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                      />{" "}
                      익명
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={isLocked}
                        onChange={(e) => setIsLocked(e.target.checked)}
                      />{" "}
                      비밀글
                    </label>
                  </div>
                  <button className="submit-btn" onClick={handleAddPost}>
                    등록
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="threads-feed">
            {paginatedPosts.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "var(--text-sub)",
                }}
              >
                등록된 스레드가 없습니다. 첫 번째 이야기를 나누어보세요!
              </div>
            ) : (
              paginatedPosts.map((post) => {
                const avatarText = post.writer.substring(0, 1).toUpperCase();
                let quotedBox = null;
                if (post.quoteId) {
                  const quotedPost = threadsData.find(
                    (p) => p.postId === post.quoteId,
                  );
                  if (quotedPost) {
                    quotedBox = (
                      <div className="quote-box">
                        <strong>@{quotedPost.writer}</strong> (ID:{" "}
                        {quotedPost.postId}):{" "}
                        {quotedPost.content.substring(0, 40)}...
                      </div>
                    );
                  }
                }

                // 💡 여기서 threadsData에 있는 해당 원문의 답글을 필터링해서 보여줍니다.
                const postReplies = threadsData.filter((p) => {
                  const match = Number(p.parentId) === Number(post.postId);
                  if (match) console.log(`글 #${post.postId}에 답글 발견!`, p); // 이게 콘솔에 뜨나요?
                  return match;
                });
                // 펼쳐짐 상태 확인
                const isExpanded = expandedReplies[post.postId] || false;
                // 보여줄 댓글 (5개 이하일 땐 전체, 5개 넘으면 slice)
                const displayedReplies = isExpanded
                  ? postReplies
                  : postReplies.slice(0, 5);
                return (
                  <div className="thread-post" key={post.postId}>
                    <div className="post-layout">
                      <div className="profile-column">
                        <div
                          className="user-avatar"
                          style={{
                            backgroundColor:
                              post.writer === "익명" ? "#555" : "#333",
                          }}
                        >
                          {avatarText}
                        </div>
                        <div className="profile-line"></div>
                      </div>
                      <div className="content-column">
                        <div className="post-header">
                          <div className="post-author">
                            {post.writer}{" "}
                            <span
                              style={{
                                fontSize: "11px",
                                color: "var(--text-sub)",
                                fontWeight: "normal",
                              }}
                            >
                              #{post.postId}
                            </span>{" "}
                            {post.category && (
                              <span
                                className="post-badge"
                                style={{ background: "#222", color: "#ffd700" }}
                              >
                                {post.category}
                              </span>
                            )}
                            {post.writer === "익명" && (
                              <span className="post-badge">익명</span>
                            )}
                            {post.isLocked && (
                              <span
                                className="post-badge"
                                style={{
                                  background: "#5c4d00",
                                  color: "#ffd700",
                                }}
                              >
                                비밀글
                              </span>
                            )}
                          </div>
                          <div className="post-meta">
                            <span>
                              {new Date(post.createdAt).toLocaleString()}
                            </span>
                            <button
                              className="delete-btn"
                              onClick={() => handleDeletePost(post.postId)}
                            >
                              삭제
                            </button>
                          </div>
                        </div>

                        <div className="post-body">
                          {post.isLocked
                            ? "작성자와 관리자만 볼 수 있는 비밀 스레드입니다."
                            : post.content}
                        </div>

                        {post.imgUrl && (
                          <div className="post-image">
                            <img src={post.imgUrl} alt="첨부" />
                          </div>
                        )}
                        {quotedBox}

                        <div className="post-actions">
                          <div
                            className={`action-item ${post.isLikedByUser ? "liked" : ""}`}
                            onClick={() => handleToggleLike(post.postId)}
                          >
                            {post.isLikedByUser ? "❤️" : "🤍"}{" "}
                            <span className="like-count">{post.likeCount}</span>
                          </div>
                          <div className="action-item">
                            💬{" "}
                            <span className="comment-count">
                              {post.replyCount || postReplies.length}
                            </span>
                          </div>
                          <div
                            className="action-item"
                            onClick={() => handleSelectQuote(post.postId)}
                          >
                            🔁 <span>인용하기</span>
                          </div>
                        </div>

                        <div className="comments-section">
                          <div className="comments-list">
                            {displayedReplies.map((reply) => (
                              <div className="comment-item" key={reply.postId}>
                                <div className="comment-avatar">
                                  {reply.writer.substring(0, 1).toUpperCase()}
                                </div>
                                <div className="comment-content-box">
                                  <div className="comment-header">
                                    <span className="comment-author">
                                      {reply.writer}
                                    </span>
                                    <div className="post-meta">
                                      <span>
                                        {new Date(
                                          reply.createdAt,
                                        ).toLocaleString()}
                                      </span>
                                      <button
                                        className="delete-btn"
                                        style={{ fontSize: "10px" }}
                                        onClick={() =>
                                          handleDeletePost(reply.postId)
                                        }
                                      >
                                        삭제
                                      </button>
                                    </div>
                                  </div>
                                  <div className="comment-text">
                                    {reply.content}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          {/* 💡 5개 넘을 때만 버튼 노출 */}
                          {postReplies.length > 5 && (
                            <button
                              className="more-replies-btn"
                              onClick={() =>
                                setExpandedReplies((prev) => ({
                                  ...prev,
                                  [post.postId]: !isExpanded,
                                }))
                              }
                              style={{
                                display: "block",
                                margin: "10px 0",
                                fontSize: "12px",
                                cursor: "pointer",
                                padding: "6px 12px",
                                backgroundColor: "#ffffff", // 기본 배경 하얀색
                                border: "1px solid #eeeeee", // 아주 연한 외곽선
                                color: "#666",
                                transition: "all 0.2s ease",
                              }}
                            >
                              {isExpanded
                                ? "▲ 답글 접기"
                                : `▼ 답글 ${postReplies.length - 5}개 더보기`}
                            </button>
                          )}

                          {!post.isLocked && (
                            <div className="comment-write-box">
                              <input
                                type="text"
                                className="comment-input"
                                placeholder="답글 작성"
                                value={commentInputs[post.postId] || ""}
                                onChange={(e) =>
                                  setCommentInputs({
                                    ...commentInputs,
                                    [post.postId]: e.target.value,
                                  })
                                }
                                onKeyUp={(e) => {
                                  if (e.key === "Enter")
                                    handleAddComment(post.postId);
                                }}
                              />
                              <button
                                className="comment-submit-btn"
                                onClick={() => handleAddComment(post.postId)}
                              >
                                등록
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {totalPages > 1 && (
            <div className="pagination-container">
              <button
                className="page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
              >
                이전
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <button
                    key={pageNum}
                    className={`page-btn ${currentPage === pageNum ? "active" : ""}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                ),
              )}
              <button
                className="page-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                다음
              </button>
            </div>
          )}
        </div>
      </div>
      <br />
      <br />
      <br />
    </>
  );
}