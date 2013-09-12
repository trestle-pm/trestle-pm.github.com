angular.module('templates-app', ['board/columns/issue_columns.tpl.html', 'board/columns/milestone_columns.tpl.html', 'issue/convert_to_pull.tpl.html', 'issue/issue.tpl.html', 'issue/issue_details.tpl.html', 'issue_filters/issue_filter.tpl.html', 'login/login.tpl.html', 'repos.tpl.html', 'services/missing_config_dialog.tpl.html', 'toolbar/toolbar.tpl.html']);

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
    "    <li ng-show=\"showBacklog\" class=\"column\"\n" +
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
    "      <div class=\"milestone_selection\">\n" +
    "        <select ng-init=\"msFilterVal='*'\"\n" +
    "                ng-model=\"msFilterVal\"\n" +
    "                ng-options=\"m.value as m.title for m in columnsCtrl.getMilestoneSelectOptions()\">\n" +
    "        </select>\n" +
    "      </div>\n" +
    "\n" +
    "      <!-- CARDS List -->\n" +
    "      <ul class=\"column-body\"\n" +
    "          ui-sortable=\"colCtrl.getSortableOptions()\" >\n" +
    "\n" +
    "        <li class=\"card_wrapper\"\n" +
    "             ng-repeat=\"issue in colCtrl.issues | filterMilestones:msFilterVal | globalIssueFilter\"\n" +
    "             data-issue-id=\"{{issue.id}}\" >\n" +
    "          <tr-issue-card issue=\"issue\" />\n" +
    "        </li>\n" +
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
    "      <h1 class=\"column-header\">\n" +
    "        <span class=\"column_name\">{{colCtrl.columnName}}</span>\n" +
    "        <span ng-class=\"{\n" +
    "                over_limit: colCtrl.issues.length > repoModel.config.wip_limit\n" +
    "              }\"\n" +
    "              class=\"wip_count\">{{colCtrl.issues.length}}</span>\n" +
    "      </h1>\n" +
    "\n" +
    "      <!-- CARDS List -->\n" +
    "      <ul class=\"column-body\"\n" +
    "          ui-sortable=\"colCtrl.getSortableOptions()\" >\n" +
    "\n" +
    "        <li class=\"card_wrapper\"\n" +
    "            ng-repeat=\"issue in colCtrl.issues | globalIssueFilter\"\n" +
    "            data-issue-id=\"{{issue.id}}\" >\n" +
    "\n" +
    "          <tr-issue-card issue=\"issue\" />\n" +
    "\n" +
    "        </li>\n" +
    "      </ul>\n" +
    "      <!-- end of card list -->\n" +
    "    </li>\n" +
    "\n" +
    "  </ul>\n" +
    "</div>\n" +
    "");
}]);

angular.module("board/columns/milestone_columns.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("board/columns/milestone_columns.tpl.html",
    "<div ng-controller=\"MilestoneColumnsCtrl as columnsCtrl\" >\n" +
    "\n" +
    "  <ul class=\"milestone-columns\" >\n" +
    "    <!-- Empty Milestone Column -->\n" +
    "    <li ng-style=\"columnsCtrl.getColumnWidth()\"\n" +
    "        ng-controller=\"IssueColumnCtrl as colCtrl\"\n" +
    "        ng-init=\"colCtrl.init({isNoMilestone:true})\" >\n" +
    "\n" +
    "      <h1 class=\"column-header\">{{colCtrl.columnName}}</h1>\n" +
    "\n" +
    "      <!-- CARDS List -->\n" +
    "      <ul class=\"column-body\"\n" +
    "          ui-sortable=\"colCtrl.getSortableOptions()\" >\n" +
    "\n" +
    "        <li class=\"card_wrapper\"\n" +
    "             ng-repeat=\"issue in colCtrl.issues | filter:issueFilters.searchText\"\n" +
    "             data-issue-id=\"{{issue.id}}\" >\n" +
    "          <tr-issue-card issue=\"issue\" />\n" +
    "        </li>\n" +
    "      </ul> <!-- end of card list -->\n" +
    "    </li>\n" +
    "\n" +
    "    <!-- Kanban Columns -->\n" +
    "    <li ng-repeat=\"ms in repoModel.milestones\" class=\"column\"\n" +
    "        ng-style=\"columnsCtrl.getColumnWidth()\"\n" +
    "\n" +
    "        ng-controller=\"IssueColumnCtrl as colCtrl\"\n" +
    "        ng-init=\"colCtrl.init({milestone:ms})\" >\n" +
    "\n" +
    "      <h1 class=\"column-header\">\n" +
    "        <span class=\"column_name\">{{colCtrl.columnName}}</span>\n" +
    "      </h1>\n" +
    "\n" +
    "      <!-- CARDS List -->\n" +
    "      <ul class=\"column-body\"\n" +
    "          ui-sortable=\"colCtrl.getSortableOptions()\" >\n" +
    "\n" +
    "        <li class=\"card_wrapper\"\n" +
    "            ng-repeat=\"issue in colCtrl.issues | filter:issueFilters.searchText\"\n" +
    "            data-issue-id=\"{{issue.id}}\" >\n" +
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

angular.module("issue/convert_to_pull.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("issue/convert_to_pull.tpl.html",
    "<div class=\"convert_to_pull\"\n" +
    "     ng-controller=\"ConvertToPullCtrl as convertCtrl\"\n" +
    "     ng-init=\"convertCtrl.init(issue)\" >\n" +
    "\n" +
    "  <div class=\"modal-header\">\n" +
    "    <h3>Convert Issue to pull</h3>\n" +
    "  </div>\n" +
    "\n" +
    "  <p>We are converting pull for issue: {{convertCtrl.issue.title}}</p>\n" +
    "\n" +
    "  <div class=\"branches\">\n" +
    "    <!-- Base Branch -->\n" +
    "    <span class=\"branch_type\">Base Branch:</span>\n" +
    "    <div class=\"branch-selector dropdown\" >\n" +
    "      <a class=\"btn dropdown-toggle-no-close\" >\n" +
    "        {{convertCtrl.baseBranch}}<span class=\"caret\"></span>\n" +
    "      </a>\n" +
    "\n" +
    "      <div class=\"branch-pulldown dropdown-menu\">\n" +
    "        <div class=\"menu-header no-close\">\n" +
    "          <span class=\"menu-title\">Choose base branch</span>\n" +
    "        </div>\n" +
    "        <div class=\"menu-filter no-close\" >\n" +
    "          <input type=\"text\" placeholder=\"Search\" ng-model=\"baseBranchSearch\"\n" +
    "                 class=\"search-query\" ></input>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"menu-list\">\n" +
    "          <div class=\"menu-item\"\n" +
    "              ng-repeat=\"branch in convertCtrl.branches | filter:baseBranchSearch\"\n" +
    "              ng-click=\"convertCtrl.selectBaseBranch(branch.name)\">\n" +
    "            {{branch.name}}\n" +
    "          </div>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- Topic Branch -->\n" +
    "    <span class=\"branch_type\">Topic Branch:</span>\n" +
    "    <div class=\"branch-selector dropdown\" >\n" +
    "      <a class=\"btn dropdown-toggle-no-close\" >\n" +
    "        {{convertCtrl.topicBranch}}<span class=\"caret\"></span>\n" +
    "      </a>\n" +
    "\n" +
    "      <div class=\"branch-pulldown dropdown-menu\">\n" +
    "        <div class=\"menu-header no-close\">\n" +
    "          <span class=\"menu-title\">Choose topic branch</span>\n" +
    "        </div>\n" +
    "        <div class=\"menu-filter no-close\" >\n" +
    "          <input type=\"text\" placeholder=\"Search\" ng-model=\"topicBranchSearch\"\n" +
    "                 class=\"search-query\" ></input>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"menu-list\">\n" +
    "          <div class=\"menu-item\"\n" +
    "              ng-repeat=\"branch in convertCtrl.branches | filter:topicBranchSearch\"\n" +
    "              ng-click=\"convertCtrl.selectTopicBranch(branch.name)\">\n" +
    "            {{branch.name}}\n" +
    "          </div>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "  </div>\n" +
    "\n" +
    "  <button ng-click=\"convertCtrl.convertToPull()\"\n" +
    "          class=\"btn btn-primary\"\n" +
    "          ng-disabled=\"convertCtrl.baseBranch === convertCtrl.topicBranch\">\n" +
    "    Convert\n" +
    "  </button>\n" +
    "\n" +
    "  <div class=\"compare_summary\"\n" +
    "       ng-show=\"convertCtrl.compareResults\">\n" +
    "    <p>Status: {{convertCtrl.compareResults.status}}</p>\n" +
    "    <p>Total commits: {{convertCtrl.compareResults.total_commits}}</p>\n" +
    "    <p>Files changed: {{convertCtrl.compareResults.files.length}}</p>\n" +
    "    <a class=\"btn\" target=\"_blank\"\n" +
    "     ng-href=\"{{convertCtrl.compareResults.html_url}}\">Compare</a>\n" +
    "\n" +
    "    <div class=\"commit_list\">\n" +
    "      <div class=\"commit\"\n" +
    "           ng-repeat=\"commit in convertCtrl.compareResults.commits\">\n" +
    "        <img class=\"avatar\"\n" +
    "             ng-src=\"{{commit.committer.avatar_url}}?s=30\"></img>\n" +
    "        <span class=\"committer\"> {{commit.committer.name}} </span>\n" +
    "        <a ng-href=\"{{commit.url}}\" class=\"message\">{{commit.commit.message}}</span>\n" +
    "        <a ng-href=\"{{commit.url}}\" class=\"sha\">{{commit.sha | limitTo:7}}</span>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"file_list\">\n" +
    "      <div>Files:</div>\n" +
    "      <div class=\"file_details\"\n" +
    "           ng-repeat=\"file in convertCtrl.compareResults.files\">\n" +
    "        <div class=\"file_header\">{{file.filename}} - {{file.additions}} - {{file.deletions}}</div>\n" +
    "        <div class=\"patch\">\n" +
    "          <pre>{{file.patch}}</pre>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "  </div>\n" +
    "\n" +
    "</div>\n" +
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
    "    <a ng-href=\"{{issueCtrl.issue.html_url}}\"\n" +
    "       ng-click=\"$event.stopPropagation()\"\n" +
    "       target=\"_blank\"\n" +
    "       title=\"Open on GitHub\"\n" +
    "       class=\"number ng-scope\">\n" +
    "       <i ng-if=\"issueCtrl.isPullRequest()\" class=\"icon-code-fork\"></i>\n" +
    "       {{issueCtrl.issue.number}}\n" +
    "    </a>\n" +
    "    <span class=\"title\">\n" +
    "      {{issueCtrl.issue.title}}\n" +
    "    </span>\n" +
    "    <img class=\"avatar\"\n" +
    "         ng-class=\"{\n" +
    "            empty: !issueCtrl.issue.assignee\n" +
    "         }\"\n" +
    "         title=\"Assigned to {{issueCtrl.getAssignedUserDetails(30).name}}\"\n" +
    "         ng-src=\"{{issueCtrl.getAssignedUserDetails(30).avatar_url}}\"/>\n" +
    "  </div>\n" +
    "  <div class=\"content\">\n" +
    "      <span class=\"milestone\" ng-show=\"issue.milestone\">\n" +
    "        {{issueCtrl.issue.milestone.title}}\n" +
    "      </span>\n" +
    "      <span class=\"label\"\n" +
    "            ng-repeat=\"label in issueCtrl.issue.labels | nonColumnLabels\"\n" +
    "            style=\"background-color: #{{label.color}}\">\n" +
    "          {{label.name}}\n" +
    "      </span>\n" +
    "  </div>\n" +
    "  <div class=\"reviews\"\n" +
    "       ng-if=\"issueCtrl.issue.tr_comments.length > 0\">\n" +
    "    <div class=\"votes\">\n" +
    "        <div class=\"vote_count\"\n" +
    "             ng-class=\"{\n" +
    "              positive: issueCtrl.issue.tr_comment_voting.total > 0,\n" +
    "              negative: issueCtrl.issue.tr_comment_voting.total < 0\n" +
    "             }\">\n" +
    "          {{issueCtrl.issue.tr_comment_voting.total}}\n" +
    "        </div>\n" +
    "        <img ng-repeat=\"(login, details) in issueCtrl.issue.tr_comment_voting.users\"\n" +
    "             class=\"vote_avatar\"\n" +
    "             title=\"{{login}} {{details.count}}\"\n" +
    "             ng-src=\"{{details.avatar_url}}?s=30\"\n" +
    "             ng-class=\"{\n" +
    "              yes: details.count > 0,\n" +
    "              no: details.count < 0\n" +
    "             }\"\n" +
    "             />\n" +
    "    </div>\n" +
    "    <div class=\"stats\">\n" +
    "        <!--<span class=\"todos\"><i class=\"icon-check\"></i>3/6</span>-->\n" +
    "        <span class=\"comments\">\n" +
    "            <i class=\"icon-comments\"></i>\n" +
    "            {{issueCtrl.issue.tr_comments.length}}\n" +
    "        </span>\n" +
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
    "            ng-class=\"{\n" +
    "                empty: !issueCtrl.issue.assignee\n" +
    "             }\"\n" +
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
    "\n" +
    "    <div class=\"milestone\">\n" +
    "      <select ng-init=\"msValue=issueCtrl.issue.milestone.number\"\n" +
    "              ng-model=\"msValue\"\n" +
    "              ng-options=\"m.number as m.title for m in repoModel.milestones\"\n" +
    "              ng-change=\"issueCtrl.assignMilestone(msValue)\">\n" +
    "        <option value=\"\">No Milestone</option>\n" +
    "      </select>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"branch_info\" ng-show=\"issueCtrl.isPullRequest()\">\n" +
    "      to {{issueCtrl.issue.tr_pull_details.base.label}}\n" +
    "      from {{issueCtrl.issue.tr_pull_details.tr_head.label}}\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"label_bar\">\n" +
    "    <span class=\"label\"\n" +
    "      ng-repeat=\"label in issueCtrl.issue.labels | nonColumnLabels\"\n" +
    "      style=\"background-color: #{{label.color}}\">\n" +
    "      {{label.name}}\n" +
    "    </span>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"label_editor dropdown\">\n" +
    "    <button class=\"btn dropdown-toggle-no-close\">Edit<span class=\"caret\"/></button>\n" +
    "\n" +
    "    <div class=\"dropdown-menu\">\n" +
    "      <div class=\"label-list no-close\">\n" +
    "         <div class=\"label-item\"\n" +
    "              ng-repeat=\"label in repoModel.labels | nonColumnLabels\"\n" +
    "              ng-click=\"issueCtrl.toggleLabel(label)\"\n" +
    "              ng-class=\"{\n" +
    "                enabled: issueCtrl.isLabelEnabled(label.name)\n" +
    "              }\">\n" +
    "              <span class=\"pill\" style=\"background-color: #{{label.color}}\">\n" +
    "                 {{label.name}}\n" +
    "              </span>\n" +
    "          </div>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div>\n" +
    "    <button ng-if=\"!issueCtrl.isPullRequest()\"\n" +
    "            class=\"convert_pull btn btn-primary\"\n" +
    "            ng-click=\"issueCtrl.convertToPull()\">\n" +
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

angular.module("issue_filters/issue_filter.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("issue_filters/issue_filter.tpl.html",
    "<div id=\"issue-filters-drawer\"\n" +
    "     ng-controller=\"IssueFilterCtrl as filterCtrl\"\n" +
    "     ng-init=\"filterCtrl.init()\" >\n" +
    "\n" +
    "  <button id=\"filterToggleBtn\"\n" +
    "          class=\"btn-primary\"\n" +
    "          ng-click=\"fitlerCtrl.showDrawer = !fitlerCtrl.showDrawer\" >\n" +
    "    <span ng-if=\"fitlerCtrl.showDrawer\">Hide</span>\n" +
    "    <span ng-if=\"!fitlerCtrl.showDrawer\">Show</span>\n" +
    "  </button>\n" +
    "\n" +
    "\n" +
    "  <div class=\"drawer\" ng-class=\"{show: fitlerCtrl.showDrawer,\n" +
    "                                 hide: !fitlerCtrl.showDrawer}\" >\n" +
    "    <h1>Filters</h1>\n" +
    "    <ul >\n" +
    "      <li ng-click=\"filterCtrl.setFilter('owner', sessionModel.user.login)\"\n" +
    "          ng-class=\"{active: issueFilters.owner == sessionModel.user.login}\">\n" +
    "        Assigned to Me\n" +
    "      </li>\n" +
    "      <li ng-click=\"filterCtrl.setFilter('reviewer', sessionModel.user.login)\"\n" +
    "          ng-class=\"{active: issueFilters.reviewer == sessionModel.user.login}\">\n" +
    "        Reviewed by Me\n" +
    "      </li>\n" +
    "    </ul>\n" +
    "\n" +
    "    <ul class=\"clearfix\" >\n" +
    "      <li ng-repeat=\"user in repoModel.assignees\"\n" +
    "          ng-click=\"filterCtrl.setFilter('owner', user.login)\"\n" +
    "          ng-class=\"{active: issueFilters.owner == user.login}\"\n" +
    "          style=\"float: left;\" >\n" +
    "        <img class=\"avatar\" ng-src=\"{{user.avatar_url}}?s=30\" ng-title=\"{{user.login}}\" />\n" +
    "      </li>\n" +
    "    </ul>\n" +
    "\n" +
    "    <ul class=\"clearfix\" >\n" +
    "      <li ng-repeat=\"milestone in repoModel.milestones\"\n" +
    "          ng-click=\"filterCtrl.setFilter('milestone', milestone.title)\"\n" +
    "          ng-class=\"{active: issueFilters.milestone == milestone.title}\" >\n" +
    "        {{milestone.title}}\n" +
    "      </li>\n" +
    "    </ul>\n" +
    "\n" +
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
    "        <a class=\"dropdown-toggle-no-close\" >\n" +
    "          <span ng-if=\"!repoModel.repo\" >yourname/repo</span>\n" +
    "          <span ng-if=\"repoModel.repo\" >{{repoModel.getFullRepoName()}}</span>\n" +
    "        </a>\n" +
    "\n" +
    "        <div id=\"repo-list\" class=\"dropdown-menu\">\n" +
    "          <div class=\"filter no-close\" >\n" +
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
    "            </li>\n" +
    "          </ol>\n" +
    "\n" +
    "        </div>\n" +
    "      </li>\n" +
    "\n" +
    "      <li>\n" +
    "        <input id=\"issue-search\" type=\"text\" placeholder=\"Search\" class=\"navbar-search\"\n" +
    "               ng-model=\"issueFilters.searchText\" ></input>\n" +
    "      </li>\n" +
    "    </ul>\n" +
    "\n" +
    "    <button class=\"pull-right btn\"\n" +
    "            ng-click=\"toolbarCtrl.refreshRepo()\">\n" +
    "      <i class=\"icon-refresh\"\n" +
    "         ng-class=\"{ 'icon-spin': toolbarCtrl.isRefreshing }\"></i>\n" +
    "    </button>\n" +
    "\n" +
    "    <ul class=\"nav pull-right\"\n" +
    "        ng-controller=\"UserDetailsCtrl as userCtrl\"\n" +
    "        ng-init=\"userCtrl.init()\">\n" +
    "\n" +
    "      <li class=\"dropdown\" >\n" +
    "        <a id=\"settings\" class=\"dropdown-toggle-no-close\" >\n" +
    "          <img class=\"avatar\" ng-src=\"{{sessionModel.user.avatar_url}}\" ></img>\n" +
    "          {{sessionModel.user.login}}\n" +
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
    "        <a ng-href=\"#repo/{{repoModel.owner}}/{{repoModel.repo}}/milestones\">Milestones</a>\n" +
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
