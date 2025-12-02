import './SearchBar.css'

export default function SearchBar({
  searchQuery,
  handleSearch,
  searchResults,
  showSearchResults,
  handleStartConversation,
}) {
  return (
    <div className="search-bar-container">
      <input
        type="text"
        placeholder="Search users..."
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        className="search-input"
      />

      {showSearchResults && (
        <div className="search-results">
          {searchResults.length === 0 ? (
            <div className="empty-state">
              <p>No users found</p>
            </div>
          ) : (
            searchResults.map((searchUser) => (
              <div
                key={searchUser.id}
                className="search-result-item"
                onClick={() => handleStartConversation(searchUser.id)}
              >
                <div className="user-avatar-small">
                  <span className="avatar-placeholder-small">
                    {searchUser.username?.charAt(0).toUpperCase()}
                  </span>
                  <span className="online-indicator"></span>
                </div>
                <div className="search-result-info">
                  <div className="search-result-name">
                    {searchUser.display_name || searchUser.username}
                  </div>
                  <div className="search-result-username">@{searchUser.username}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
