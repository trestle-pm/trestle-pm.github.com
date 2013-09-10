angular.module('templates-app', ['board/columns/issue_columns.tpl.html', 'board/users/users_list.tpl.html', 'issue/issue.tpl.html', 'issue/issue_details.tpl.html', 'login/login.tpl.html', 'repos.tpl.html', 'services/missing_config_dialog.tpl.html', 'toolbar/toolbar.tpl.html']);

angular.module("board/columns/issue_columns.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("board/columns/issue_columns.tpl.html",
    "<div ng-controller=\"ColumnsCtrl as columnsCtrl\" >\n" +
    "  <button class=\"btn btn-primary backlog\"\n" +
    "          ng-click=\"showBacklog = !showBacklog\">\n" +
    "    {{showBacklog ? 'Hide Backlog' : 'Show Backlog'}}\n" +
    "  </button>\n" +
    "\n" +
    "  <ul class=\"issue-columns\" >\n" +
    "    <!-- Backlog Column -->\n" +
    "    <li ng-show=\"showBacklog\"\n" +
    "\n" +
    "        ng-style=\"columnsCtrl.getColumnWidth()\"\n" +
    "\n" +
    "        ng-controller=\"IssueColumnCtrl as colCtrl\"\n" +
    "        ng-init=\"colCtrl.init({isBacklog:true})\" >\n" +
    "\n" +
    "      <h1 class=\"column-header\">{{colCtrl.columnName}}</h1>\n" +
    "\n" +
    "      <a class=\"btn btn-success\"\n" +
    "         ng-href=\"https://github.com/{{repoModel.owner}}/{{repoModel.repo}}/issues/new\"\n" +
    "         target=\"_blank\">Create Issue</a>\n" +
    "\n" +
    "      <!-- CARDS List -->\n" +
    "      <ul class=\"column-body\" ui-sortable=\"colCtrl.geSortableOptions()\" >\n" +
    "        <div class=\"card_wrapper\"\n" +
    "             ng-repeat=\"issue in repoModel.issues | issuesInBacklog | filter:repoModel.cardSearchText\"\n" +
    "             data-issue-id=\"{{issue.id}}\" >\n" +
    "          <tr-issue-card issue=\"issue\" />\n" +
    "        </div>\n" +
    "      </ul> <!-- end of card list -->\n" +
    "    </li>\n" +
    "\n" +
    "    <!-- Kanban Columns -->\n" +
    "    <li ng-repeat=\"col_label in repoModel.config.columns\" class=\"column\"\n" +
    "        ng-style=\"columnsCtrl.getColumnWidth()\"\n" +
    "\n" +
    "        ng-controller=\"IssueColumnCtrl as colCtrl\"\n" +
    "        ng-init=\"colCtrl.init({labelName:col_label})\" >\n" +
    "\n" +
    "      <h1 class=\"column-header\">{{colCtrl.columnName}}</h1>\n" +
    "\n" +
    "      <!-- CARDS List -->\n" +
    "      <ul class=\"column-body\" ui-sortable=\"colCtrl.getSortableOptions()\" >\n" +
    "        <li class=\"card_wrapper\"\n" +
    "             ng-repeat=\"issue in repoModel.issues | issuesWithLabel:colCtrl.labelName | filter:repoModel.cardSearchText | orderBy:'config.weight'\"\n" +
    "             data-issue-id=\"{{issue.id}}\" >\n" +
    "          <tr-issue-card issue=\"issue\" />\n" +
    "        </li>\n" +
    "      </ul>\n" +
    "      <!-- end of card list -->\n" +
    "    </li>\n" +
    "\n" +
    "  </ul>\n" +
    "</div>\n" +
    "");
}]);

angular.module("board/users/users_list.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("board/users/users_list.tpl.html",
    "<ul ng-controller=\"UsersListCtrl as usersCtrl\" class=\"user-list\" >\n" +
    "  <li ng-repeat=\"user in usersCtrl.users\" class=\"user\" ng-draggable=\"getDragData()\" >\n" +
    "    <img class=\"avatar\" ng-src=\"{{user.avatar_url}}?s=30\" ></img>\n" +
    "    {{user.login}}\n" +
    "  </li>\n" +
    "</ul>\n" +
    "");
}]);

angular.module("issue/issue.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("issue/issue.tpl.html",
    "<div ng-controller=\"IssueCtrl as issueCtrl\"\n" +
    "     class=\"card\"\n" +
    "     ng-class=\"issueCtrl.getBuildStatus()\"\n" +
    "     ng-click=\"issueCtrl.showIssueDetails()\"\n" +
    "    >\n" +
    "\n" +
    "  <div ng-if=\"issueCtrl.isPullRequest()\"\n" +
    "       class=\"build_header\"></div>\n" +
    "  <div class=\"header\">\n" +
    "    <span class=\"title\">\n" +
    "      {{issueCtrl.issue.title}}\n" +
    "    </span>\n" +
    "    <img class=\"avatar\"\n" +
    "         title=\"Assigned to {{issueCtrl.getAssignedUserDetails(30).name}}\"\n" +
    "         ng-src=\"{{issueCtrl.getAssignedUserDetails(30).avatar_url}}\"/>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"milestone\" ng-show=\"issue.milestone\">\n" +
    "    {{issueCtrl.issue.milestone.title}}\n" +
    "  </div>\n" +
    "\n" +
    "  <ul class=\"labels\">\n" +
    "    <li ng-if=\"issueCtrl.isPullRequest()\" class=\"pull\">pull</li>\n" +
    "    <li ng-repeat=\"label in issueCtrl.issue.labels | nonColumnLabels\"\n" +
    "        style=\"background-color: #{{label.color}}\">\n" +
    "      {{label.name}}\n" +
    "    </li>\n" +
    "  </ul>\n" +
    "\n" +
    "  <div class=\"voting_bar\">\n" +
    "    <ul class=\"votes\">\n" +
    "      <li ng-repeat=\"(login, details) in issueCtrl.issue.tr_comment_voting.users\">\n" +
    "        <img class=\"vote_avatar\"\n" +
    "             title=\"{{login}} {{details.count}}\"\n" +
    "             ng-src=\"{{details.avatar_url}}?s=30\"\n" +
    "             ng-class=\"{\n" +
    "              yes: details.count > 0,\n" +
    "              no: details.count < 0\n" +
    "             }\"\n" +
    "             ></img>\n" +
    "      </li>\n" +
    "    </ul>\n" +
    "\n" +
    "    <div class=\"vote_count\"\n" +
    "         ng-class=\"{\n" +
    "          positive: issueCtrl.issue.tr_comment_voting.total > 0,\n" +
    "          negative: issueCtrl.issue.tr_comment_voting.total < 0\n" +
    "         }\">\n" +
    "      {{issueCtrl.issue.tr_comment_voting.total}}\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "\n" +
    "");
}]);

angular.module("issue/issue_details.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("issue/issue_details.tpl.html",
    "<div class=\"issue_detail\"\n" +
    "     ng-controller=\"IssueCtrl as issueCtrl\"\n" +
    "     ng-init=\"issueCtrl.init(issue)\" >\n" +
    "\n" +
    "  <div class=\"header\">\n" +
    "    <li class=\"user-selector dropdown\">\n" +
    "      <a class=\"dropdown-toggle\">\n" +
    "        <img class=\"avatar\"\n" +
    "             title=\"Assigned to {{issueCtrl.getAssignedUserDetails(30).name}}\"\n" +
    "             ng-src=\"{{issueCtrl.getAssignedUserDetails(30).avatar_url}}\"/>\n" +
    "      </a>\n" +
    "      <ul class=\"dropdown-menu\">\n" +
    "        <li ng-repeat=\"user in repoModel.assignees\"\n" +
    "            class=\"assignee\"\n" +
    "            ng-click=\"issueCtrl.assignUser(user)\">\n" +
    "          <img class=\"avatar\" ng-src=\"{{user.avatar_url}}?s=30\"></img>\n" +
    "          <span class=\"user_login\">{{user.login}}</span>\n" +
    "        </li>\n" +
    "      </ul>\n" +
    "    </li>\n" +
    "\n" +
    "    <span class=\"title\">\n" +
    "      {{issueCtrl.issue.title}}\n" +
    "    </span>\n" +
    "    <a target=\"_blank\" ng-href=\"{{issueCtrl.issue.html_url}}\">\n" +
    "      <i class=\"icon-share\"></i>\n" +
    "    </a>\n" +
    "    <i class=\"icon-remove\" ng-click=\"$close()\"></i>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"status_header\">\n" +
    "    <div ng-if=\"issueCtrl.isPullRequest()\"\n" +
    "         class=\"build_status\"\n" +
    "         ng-class=\"issueCtrl.getBuildStatus()\">\n" +
    "      <a href=\"{{issueCtrl.tr_top_build_status.target_url}}\" target=\"_blank\">\n" +
    "      {{issueCtrl.tr_top_build_status.description}}\n" +
    "      </a>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"comment_summary\">\n" +
    "      <div class=\"summary\">\n" +
    "         {{issueCtrl.tr_comments.length}} comments\n" +
    "      </div>\n" +
    "\n" +
    "      <div class=\"vote_count\"\n" +
    "          ng-class=\"{\n" +
    "           positive: issueCtrl.issue.tr_comment_voting.total > 0,\n" +
    "           negative: issueCtrl.issue.tr_comment_voting.total < 0\n" +
    "          }\">\n" +
    "       {{issueCtrl.issue.tr_comment_voting.total}}\n" +
    "     </div>\n" +
    "    </div>\n" +
    "\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"details\">\n" +
    "    <div class=\"milestone\" ng-show=\"issue.milestone\">\n" +
    "      {{issueCtrl.issue.milestone.title}}\n" +
    "    </div>\n" +
    "    <div class=\"branch_info\" ng-show=\"issueCtrl.isPullRequest()\">\n" +
    "      to {{issueCtrl.issue.tr_pull_details.base.label}}\n" +
    "      from {{issueCtrl.issue.tr_pull_details.tr_head.label}}\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"label_bar\">\n" +
    "    <div class=\"label_block\">\n" +
    "      <li ng-repeat=\"label in issueCtrl.issue.labels | nonColumnLabels\"\n" +
    "          style=\"background-color: #{{label.color}}\">\n" +
    "        {{label.name}}\n" +
    "      </li>\n" +
    "    </div>\n" +
    "\n" +
    "    <button ng-if=\"!issueCtrl.isPullRequest()\"\n" +
    "            class=\"convert_pull btn btn-primary\">\n" +
    "    Convert to Pull\n" +
    "    </button>\n" +
    "    <button ng-if=\"issueCtrl.isPullRequest()\"\n" +
    "            class=\"convert_pull btn\">\n" +
    "    View Pull\n" +
    "    </button>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"scroll_area\">\n" +
    "    <div class=\"description\">\n" +
    "      {{issueCtrl.issue.body}}\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"comments\">\n" +
    "        <div class=\"comment\"\n" +
    "            ng-repeat=\"comment in issueCtrl.issue.tr_comments\">\n" +
    "          <img class=\"commenter\"\n" +
    "               ng-src=\"{{comment.user.avatar_url}}?s=30\"/>\n" +
    "          <div class=\"comment_body\" ng-bind-html=\"comment.body_html\"/>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "</div>\n" +
    "");
}]);

angular.module("login/login.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("login/login.tpl.html",
    "<form id=\"login-form\" ng-controller=\"LoginCtrl as loginCtrl\">\n" +
    "  <input id=\"username\" placeholder=\"Username\" ng-model=\"loginCtrl.username\"></input>\n" +
    "  <input id=\"password\" placeholder=\"Password\" ng-model=\"loginCtrl.password\" type=\"password\"></input>\n" +
    "\n" +
    "  <input type=\"checkbox\" ng-model=\"loginCtrl.rememberMe\"> Remember Me\n" +
    "\n" +
    "  <button id=\"submit\" ng-click=\"loginCtrl.attemptLogin()\" >Login</button>\n" +
    "</form>\n" +
    "");
}]);

angular.module("repos.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("repos.tpl.html",
    "<div class=\"repos_base container\"\n" +
    "     ng-controller=\"ReposCtrl as reposCtrl\"\n" +
    "     ng-init=\"reposCtrl.init()\">\n" +
    "\n" +
    "  <div ng-include=\"'toolbar/toolbar.tpl.html'\"></div>\n" +
    "  <div ui-view=\"columns\" class=\"columns\"></div>\n" +
    "  <div ui-view=\"filter\"></div>\n" +
    "\n" +
    "</div>\n" +
    "");
}]);

angular.module("services/missing_config_dialog.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("services/missing_config_dialog.tpl.html",
    "<class=\"modal-header\">\n" +
    "  <h3>Missing Configuration</h3>\n" +
    "</h1>\n" +
    "\n" +
    "<div class=\"modal-body\">\n" +
    "  <p>Create Trestle configuration?</p>\n" +
    "  <p class=\"muted\">\n" +
    "    This will create a closed issue on the project to store configuration details.\n" +
    "  </p>\n" +
    "\n" +
    "</div>\n" +
    "<div class=\"modal-footer\">\n" +
    "  <button ng-click=\"$close('create')\"\n" +
    "          class=\"btn btn-primary\">Create Config</button>\n" +
    "  <button ng-click=\"$close('cancel')\"\n" +
    "          class=\"btn\">Cancel</button>\n" +
    "</div>\n" +
    "\n" +
    "");
}]);

angular.module("toolbar/toolbar.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("toolbar/toolbar.tpl.html",
    "<div class=\"board-toolbar navbar\"\n" +
    "     ng-controller=\"ToolbarCtrl as toolbarCtrl\"\n" +
    "     ng-init=\"toolbarCtrl.init()\">\n" +
    "\n" +
    "  <div class=\"navbar-inner\">\n" +
    "    <a class=\"brand\" id=\"github-link\" ng-href=\"http://github.com/{{repoModel.getFullRepoName()}}\" target=\"_blank\" >\n" +
    "      <img src=\"assets/image/GitHub-Mark-64px.png\"></img>\n" +
    "    </a>\n" +
    "\n" +
    "    <ul class=\"nav\">\n" +
    "      <li id=\"repo-selector\" class=\"dropdown\" >\n" +
    "        <a class=\"dropdown-toggle\" >\n" +
    "          <span ng-if=\"!repoModel.repo\" >yourname/repo</span>\n" +
    "          <span ng-if=\"repoModel.repo\" >{{repoModel.getFullRepoName()}}</span>\n" +
    "        </a>\n" +
    "\n" +
    "        <div id=\"repo-list\" class=\"dropdown-menu\">\n" +
    "          <div class=\"filter\" >\n" +
    "            <input type=\"text\" placeholder=\"Search\" ng-model=\"repoSearchText\"\n" +
    "                   class=\"search-query\" ></input>\n" +
    "          </div>\n" +
    "\n" +
    "          <ol class=\"repo-list\">\n" +
    "            <li ng-repeat=\"(owner, repos) in toolbarCtrl.allRepos\">\n" +
    "              {{owner}}\n" +
    "              <ol>\n" +
    "                <li ng-repeat=\"repo in repos | filter:repoSearchText\"\n" +
    "                    ng-click=\"toolbarCtrl.onSwitchToRepo(repo)\">\n" +
    "                  {{repo.full_name}}\n" +
    "                </li>\n" +
    "              </ol>\n" +
    "\n" +
    "            </li>\n" +
    "          </ol>\n" +
    "        </div>\n" +
    "      </li>\n" +
    "\n" +
    "      <li>\n" +
    "        <input id=\"issue-search\" type=\"text\" placeholder=\"Search\" class=\"navbar-search\"\n" +
    "               ng-model=\"repoModel.cardSearchText\" ></input>\n" +
    "      </li>\n" +
    "    </ul>\n" +
    "\n" +
    "    <ul class=\"nav pull-right\"\n" +
    "        ng-controller=\"UserDetailsCtrl as userCtrl\"\n" +
    "        ng-init=\"userCtrl.init()\">\n" +
    "\n" +
    "      <li class=\"dropdown\" >\n" +
    "        <a id=\"settings\" class=\"dropdown-toggle\" >\n" +
    "          <img class=\"avatar\" ng-src=\"{{userCtrl.user.avatar_url}}\"></img>\n" +
    "          {{userCtrl.user.login}}\n" +
    "        </a>\n" +
    "\n" +
    "        <div class=\"dropdown-menu\">\n" +
    "          <span ng-click=\"userCtrl.onLogout()\">Logout</span>\n" +
    "        </div>\n" +
    "      </li>\n" +
    "    </ul>\n" +
    "\n" +
    "    <ul class=\"nav pull-right\" >\n" +
    "      <li>\n" +
    "        <a ng-href=\"#repo/{{repoModel.owner}}/{{repoModel.repo}}/milestones\">Planning</a>\n" +
    "      </li>\n" +
    "\n" +
    "       <li>\n" +
    "        <a ng-href=\"#repo/{{repoModel.owner}}/{{repoModel.repo}}/board\">Board</a>\n" +
    "      </li>\n" +
    "\n" +
    "    </ul>\n" +
    "\n" +
    "  </div>\n" +
    "\n" +
    "</div>\n" +
    "");
}]);
