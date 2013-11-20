angular.module('templates-app', ['board/columns/issue_columns.tpl.html', 'board/columns/milestone_columns.tpl.html', 'issue/convert_to_pull.tpl.html', 'issue/issue.tpl.html', 'issue/issue_details.tpl.html', 'issue_filters/issue_filter.tpl.html', 'login/create_token.tpl.html', 'login/login.tpl.html', 'repos.tpl.html', 'services/missing_config_dialog.tpl.html', 'toolbar/toolbar.tpl.html']);

angular.module("board/columns/issue_columns.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("board/columns/issue_columns.tpl.html",
    "<div class=\"hide-bl\" ng-controller=\"ColumnsCtrl as columnsCtrl\"\n" +
    "      ng-class=\"{\n" +
    "         'show-bl': columnsCtrl.showBacklog,\n" +
    "         'hide-bl': !columnsCtrl.showBacklog\n" +
    "      }\">\n" +
    "\n" +
    "   <!-- Backlog Column -->\n" +
    "   <div id=\"backlog-drawer\"\n" +
    "       ng-controller=\"IssueColumnCtrl as colCtrl\"\n" +
    "       ng-init=\"colCtrl.init({isBacklog:true})\" >\n" +
    "      <button id=\"backlog-toggle-btn\"\n" +
    "              ng-click=\"columnsCtrl.showBacklog = !columnsCtrl.showBacklog\" >\n" +
    "        <span ng-if=\"!columnsCtrl.showBacklog\"><i class=\"icon-caret-right\"></i></span>\n" +
    "        <span ng-if=\"columnsCtrl.showBacklog\"><i class=\"icon-caret-left\"></i></span>\n" +
    "      </button>\n" +
    "      <div class=\"drawer\">\n" +
    "          <h1 class=\"column-header\">\n" +
    "             <span class=\"column_name\">{{colCtrl.columnName}}</span>\n" +
    "             <span class=\"wip-count\">{{(repoModel.issues | issuesInBacklog).length}}</span>\n" +
    "         </h1>\n" +
    "      <select class=\"milestone-selection\"\n" +
    "              ng-init=\"msFilterVal='*'\"\n" +
    "              ng-model=\"msFilterVal\"\n" +
    "              ng-options=\"m.value as m.title for m in columnsCtrl.getMilestoneSelectOptions()\">\n" +
    "      </select>\n" +
    "     <a id=\"new-issue\" class=\"\"\n" +
    "        ng-href=\"https://github.com/{{repoModel.owner}}/{{repoModel.repo}}/issues/new\"\n" +
    "        target=\"_blank\">New Issue</a>\n" +
    "\n" +
    "\n" +
    "     <!-- CARDS List -->\n" +
    "     <ul class=\"column-body\"\n" +
    "         tr-issue-sortable=\"colCtrl.onIssueMoved(issues, issue)\">\n" +
    "\n" +
    "       <li class=\"card-wrapper\"\n" +
    "            ng-repeat=\"issue in repoModel.issues | issuesInBacklog | filterMilestones:msFilterVal | globalIssueFilter | orderBy:'config.columnWeight'\"\n" +
    "            data-issue-id=\"{{issue.id}}\" >\n" +
    "         <tr-issue-card issue=\"issue\" />\n" +
    "       </li>\n" +
    "     </ul> <!-- end of card list -->\n" +
    "   </div>\n" +
    "</div>\n" +
    "  <ul class=\"issue-columns\" >\n" +
    "    <!-- Kanban Columns -->\n" +
    "    <li ng-repeat=\"col_label in repoModel.config.columns\" class=\"column\"\n" +
    "        ng-style=\"columnsCtrl.getColumnWidth()\"\n" +
    "\n" +
    "        ng-controller=\"IssueColumnCtrl as colCtrl\"\n" +
    "        ng-init=\"colCtrl.init({labelName:col_label});\" >\n" +
    "\n" +
    "      <h1 class=\"column-header\">\n" +
    "        <span class=\"column_name\">{{colCtrl.columnName}}</span>\n" +
    "        <span ng-class=\"{\n" +
    "                'over-limit': (repoModel.issues | issuesWithLabel:colCtrl.labelName).length > colCtrl.getWipLimit()\n" +
    "              }\"\n" +
    "              class=\"wip-count\">{{(repoModel.issues | issuesWithLabel:colCtrl.labelName).length}}</span>\n" +
    "      </h1>\n" +
    "\n" +
    "      <!-- CARDS List -->\n" +
    "      <ul class=\"column-body\" tr-issue-sortable=\"colCtrl.onIssueMoved(issues, issue)\" >\n" +
    "\n" +
    "        <li class=\"card-wrapper\"\n" +
    "            ng-repeat=\"issue in repoModel.issues | issuesWithLabel:colCtrl.labelName | globalIssueFilter | orderBy:'config.columnWeight'\"\n" +
    "            data-issue-id=\"{{issue.id}}\" >\n" +
    "\n" +
    "          <tr-issue-card issue=\"issue\" />\n" +
    "\n" +
    "        </li>\n" +
    "      </ul>\n" +
    "\n" +
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
    "          tr-issue-sortable=\"colCtrl.onIssueMoved(issues, issue)\" >\n" +
    "\n" +
    "        <li class=\"card-wrapper\"\n" +
    "             ng-repeat=\"issue in repoModel.issues | filterMilestones:'none' | globalIssueFilter | orderBy:'config.milestoneWeight'\"\n" +
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
    "          tr-issue-sortable=\"colCtrl.onIssueMoved(issues, issue)\" >\n" +
    "\n" +
    "        <li class=\"card-wrapper\"\n" +
    "            ng-repeat=\"issue in repoModel.issues | filterMilestones:colCtrl.milestone.title | globalIssueFilter | orderBy:'config.milestoneWeight'\"\n" +
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
    "<div class=\"convert-to-pull\"\n" +
    "     ng-controller=\"ConvertToPullCtrl as convertCtrl\"\n" +
    "     ng-init=\"convertCtrl.init(issue)\" >\n" +
    "  <div class=\"convert-header\">\n" +
    "     Convert <em>\"{{convertCtrl.issue.title}}\"</em> to Pull&nbsp;Request</h3>\n" +
    "  </div>\n" +
    "  <i class=\"close icon-remove\" ng-click=\"$close()\"></i>\n" +
    "  <div class=\"branches\">\n" +
    "    <!-- Topic Branch -->\n" +
    "    <span class=\"branch_type\">Merge from </span>\n" +
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
    "    <!-- Base Branch -->\n" +
    "    <span class=\"branch_type\">into</span>\n" +
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
    "   <button ng-click=\"convertCtrl.convertToPull()\"\n" +
    "             class=\"btn btn-primary\"\n" +
    "             ng-disabled=\"convertCtrl.baseBranch === convertCtrl.topicBranch\">\n" +
    "       Convert\n" +
    "     </button>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"compare-summary\"\n" +
    "       ng-show=\"convertCtrl.compareResults\">\n" +
    "\n" +
    "    <h4>Stats</h4>\n" +
    "    <ul class=\"stats-list\">\n" +
    "      <li>Status: {{convertCtrl.compareResults.status}}</li>\n" +
    "      <li>Total commits: {{convertCtrl.compareResults.total_commits}}</li>\n" +
    "      <li>Files changed: {{convertCtrl.compareResults.files.length}}</li>\n" +
    "    </ul>\n" +
    "\n" +
    "    <a class=\"compare btn\" target=\"_blank\"\n" +
    "     ng-href=\"{{convertCtrl.compareResults.html_url}}\">\n" +
    "      Compare <i class=\"icon-external-link\"/>\n" +
    "    </a>\n" +
    "\n" +
    "    <h4>Commits</h4>\n" +
    "    <div class=\"commit_list\">\n" +
    "      <div class=\"commit\"\n" +
    "           ng-repeat=\"commit in convertCtrl.compareResults.commits\">\n" +
    "        <img class=\"avatar\"\n" +
    "             ng-src=\"{{commit.committer.avatar_url}}\"></img>\n" +
    "        <span class=\"committer\"> {{commit.committer.name}} </span>\n" +
    "        <a class=\"message\" ng-href=\"{{commit.url}}\" class=\"message\">{{commit.commit.message}}</a>\n" +
    "        <a class=\"hash\" ng-href=\"{{commit.url}}\" class=\"sha\">{{commit.sha | limitTo:7}}</a>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <h4>Files</h4>\n" +
    "    <div class=\"file_list\">\n" +
    "      <div class=\"file_details\"\n" +
    "           ng-repeat=\"file in convertCtrl.compareResults.files\">\n" +
    "        <div class=\"file_header\">\n" +
    "          <span class=\"filename\">{{file.filename}}</span>\n" +
    "          <span class=\"additions\">{{file.additions}}</span>\n" +
    "          <span class=\"deletions\">{{file.deletions}}</span>\n" +
    "        <div>\n" +
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
    "<div class=\"card {{issueCtrl.getBuildStatus()}}\"\n" +
    "      ng-controller=\"IssueCtrl as issueCtrl\"\n" +
    "      ng-class=\"{\n" +
    "        updated: issueCtrl.hasBeenUpdatedSinceLastView()\n" +
    "      }\"\n" +
    "      ng-class=\"issueCtrl.getBuildStatus()\"\n" +
    "      ng-click=\"issueCtrl.showIssueDetails()\">\n" +
    "   <div class=\"build-header\"\n" +
    "         ng-if=\"issueCtrl.isPullRequest()\"\n" +
    "         title=\"{{issueCtrl.issue.tr_top_build_status.description}}\">\n" +
    "   </div>\n" +
    "   <div class=\"header\">\n" +
    "      <a class=\"issue-number\"\n" +
    "            target=\"_blank\"\n" +
    "            title=\"Open on GitHub\"\n" +
    "            ng-href=\"{{issueCtrl.issue.html_url}}\"\n" +
    "            ng-click=\"issueCtrl.markAsViewed(); $event.stopPropagation()\">\n" +
    "         <i class=\"icon-code-fork\" ng-if=\"issueCtrl.isPullRequest()\"></i>\n" +
    "         {{issueCtrl.issue.number}}\n" +
    "      </a>\n" +
    "      <span class=\"title\">\n" +
    "         {{issueCtrl.issue.title}}\n" +
    "      </span>\n" +
    "      <img class=\"avatar\"\n" +
    "            ng-class=\"{\n" +
    "               empty: !issueCtrl.issue.assignee\n" +
    "            }\"\n" +
    "            title=\"Assigned to {{(issueCtrl.issue | assignedUser).name}}\"\n" +
    "            ng-src=\"{{(issueCtrl.issue | assignedUser).avatar_url}}\"/>\n" +
    "   </div>\n" +
    "   <div class=\"content\">\n" +
    "      <span class=\"milestone\"\n" +
    "            ng-show=\"issue.milestone\">\n" +
    "         {{issueCtrl.issue.milestone.title}}\n" +
    "      </span>\n" +
    "      <span class=\"label\"\n" +
    "            style=\"background-color: #{{label.color}}\"\n" +
    "            ng-repeat=\"label in issueCtrl.issue.labels | nonColumnLabels | orderBy:'name'\">\n" +
    "         {{label.name}}\n" +
    "      </span>\n" +
    "   </div>\n" +
    "   <div class=\"reviews\"\n" +
    "        ng-if=\"issueCtrl.issue.tr_all_comments.length > 0\">\n" +
    "      <div class=\"votes\">\n" +
    "         <div class=\"vote-count\"\n" +
    "               ng-class=\"{\n" +
    "                  positive: issueCtrl.issue.tr_comment_voting.total > 0,\n" +
    "                  negative: issueCtrl.issue.tr_comment_voting.total < 0\n" +
    "               }\">\n" +
    "            {{issueCtrl.issue.tr_comment_voting.total}}\n" +
    "         </div>\n" +
    "         <img class=\"vote-avatar\"\n" +
    "               title=\"{{login}} {{details.count}}\"\n" +
    "               ng-repeat=\"(login, details) in issueCtrl.issue.tr_comment_voting.users\"\n" +
    "               ng-src=\"{{details.avatar_url}}\"\n" +
    "               ng-class=\"{\n" +
    "                  yes: details.count > 0,\n" +
    "                  no: details.count < 0\n" +
    "               }\"/>\n" +
    "      </div>\n" +
    "      <div class=\"stats\">\n" +
    "\n" +
    "        <span class=\"todos\" ng-if=\"issueCtrl.issue.tr_todos\">\n" +
    "          <i class=\"icon-check\"></i>\n" +
    "          {{issueCtrl.issue.tr_todos.finished}}/{{issueCtrl.issue.tr_todos.total}}\n" +
    "        </span>\n" +
    "\n" +
    "        <span class=\"comments\">\n" +
    "          <i class=\"icon-comments\"></i>\n" +
    "          {{issueCtrl.issue.tr_all_comments.length}}\n" +
    "        </span>\n" +
    "\n" +
    "      </div>\n" +
    "   </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("issue/issue_details.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("issue/issue_details.tpl.html",
    "<div class=\"issue_detail\"\n" +
    "      ng-controller=\"IssueCtrl as issueCtrl\"\n" +
    "      ng-init=\"issueCtrl.init(issue)\"\n" +
    "      ng-class=\"{pull: issueCtrl.isPullRequest()}\">\n" +
    "   <div class=\"header\">\n" +
    "      <span class=\"user-selector dropdown\">\n" +
    "         <a class=\"dropdown-toggle\">\n" +
    "            <img class=\"avatar\"\n" +
    "                  ng-class=\"{\n" +
    "                     empty: !issueCtrl.issue.assignee\n" +
    "                  }\"\n" +
    "                  title=\"Assigned to {{(issueCtrl.issue | assignedUser).name}}\"\n" +
    "                  ng-src=\"{{(issueCtrl.issue | assignedUser).avatar_url}}\"/>\n" +
    "         </a>\n" +
    "         <ul class=\"dropdown-menu\">\n" +
    "            <h4>Assign to:</h4>\n" +
    "            <li class=\"assignee\"\n" +
    "                  ng-repeat=\"user in repoModel.assignees\"\n" +
    "                  ng-click=\"issueCtrl.assignUser(user)\">\n" +
    "               <img class=\"avatar\" ng-src=\"{{user.avatar_url}}\"></img>\n" +
    "               <span class=\"user_login\">\n" +
    "                  {{user.login}}\n" +
    "               </span>\n" +
    "            </li>\n" +
    "         </ul>\n" +
    "      </span>\n" +
    "      <span class=\"title\">\n" +
    "         {{issueCtrl.issue.title}}\n" +
    "      </span>\n" +
    "      <a class=\"issue-number\"\n" +
    "            target=\"_blank\"\n" +
    "            href=\"{{issueCtrl.issue.html_url}}\"\n" +
    "            title=\"Open on GitHub\">\n" +
    "         <i class=\"icon-code-fork\" ng-if=\"issueCtrl.isPullRequest()\"></i>\n" +
    "         {{issueCtrl.issue.number}}\n" +
    "      </a>\n" +
    "      <i class=\"close icon-remove\" ng-click=\"$close()\"></i>\n" +
    "   </div>\n" +
    "   <div class=\"status-header\">\n" +
    "      <div ng-if=\"issueCtrl.isPullRequest()\"\n" +
    "            class=\"build-status\"\n" +
    "            ng-class=\"issueCtrl.getBuildStatus()\">\n" +
    "         <a target=\"_blank\"\n" +
    "               href=\"{{issueCtrl.issue.tr_top_build_status.target_url}}\" >\n" +
    "            {{issueCtrl.getBuildStatusText()}}\n" +
    "         </a>\n" +
    "      </div>\n" +
    "      <div class=\"comment-summary\">\n" +
    "         <!--<span class=\"todos\"><i class=\"icon-check\"></i>3/6</span>-->\n" +
    "         <span class=\"comment_number\">\n" +
    "            <i class=\"icon-comments\"></i>\n" +
    "            {{issueCtrl.issue.tr_all_comments.length}}\n" +
    "         </span>\n" +
    "         <span class=\"vote-count\"\n" +
    "               ng-class=\"{\n" +
    "                  positive: issueCtrl.issue.tr_comment_voting.total > 0,\n" +
    "                  negative: issueCtrl.issue.tr_comment_voting.total < 0\n" +
    "               }\">\n" +
    "            {{issueCtrl.issue.tr_comment_voting.total}}\n" +
    "         </span>\n" +
    "      </div>\n" +
    "   </div>\n" +
    "   <div class=\"branch-info\"\n" +
    "         ng-if=\"issueCtrl.isPullRequest()\">\n" +
    "      to <pre>{{issueCtrl.issue.tr_pull_details.base.label}}</pre>\n" +
    "      from <pre>{{issueCtrl.issue.tr_pull_details.tr_head.label}}</pre>\n" +
    "   </div>\n" +
    "   <div class=\"controls\">\n" +
    "      <select class=\"milestone\"\n" +
    "            ng-init=\"msValue=issueCtrl.issue.milestone.number\"\n" +
    "            ng-model=\"msValue\"\n" +
    "            ng-options=\"m.number as m.title for m in repoModel.milestones\"\n" +
    "            ng-change=\"issueCtrl.assignMilestone(msValue)\">\n" +
    "         <option value=\"\">No Milestone</option>\n" +
    "      </select><!--Keep collapsed to prevent spacing bug--><div class=\"label-bar\">\n" +
    "         <div class=\"label-editor dropdown\">\n" +
    "            <button class=\"btn dropdown-toggle-no-close\">\n" +
    "               Labels&nbsp;<span class=\"caret\"></span>\n" +
    "            </button>\n" +
    "            <div class=\"dropdown-menu\">\n" +
    "               <div class=\"label-list no-close\">\n" +
    "                  <div class=\"label-item\"\n" +
    "                        ng-repeat=\"label in repoModel.labels | nonColumnLabels\"\n" +
    "                        ng-click=\"issueCtrl.toggleLabel(label)\"\n" +
    "                        ng-class=\"{\n" +
    "                           enabled: issueCtrl.isLabelEnabled(label.name)\n" +
    "                        }\">\n" +
    "                     <span class=\"color-preview\"\n" +
    "                           style=\"background-color: #{{label.color}}\">\n" +
    "                     </span>\n" +
    "                     {{label.name}}\n" +
    "                  </div>\n" +
    "               </div>\n" +
    "             </div>\n" +
    "         </div><!--Keep collapsed to prevent spacing bug--><div class=\"labels\">\n" +
    "            <span class=\"label\"\n" +
    "                  style=\"background-color: #{{label.color}}\"\n" +
    "                  ng-repeat=\"label in issueCtrl.issue.labels | nonColumnLabels | orderBy:'name'\">\n" +
    "               {{label.name}}\n" +
    "            </span>&nbsp;\n" +
    "         </div>\n" +
    "      </div><!--Keep collapsed to prevent spacing bug--><button class=\"convert-pull btn btn-success\"\n" +
    "            ng-if=\"!issueCtrl.isPullRequest()\"\n" +
    "            ng-click=\"issueCtrl.convertToPull()\">\n" +
    "         Convert to Pull\n" +
    "      </button>\n" +
    "   </div>\n" +
    "   <div class=\"description\"\n" +
    "        ng-class=\"{\n" +
    "         empty: issueCtrl.issue.body.trim() === ''\n" +
    "        }\">\n" +
    "      <h4>Description:</h4>\n" +
    "      <div class=\"issue-body\"\n" +
    "         ng-bind-html=\"issueCtrl.issue.body_html\">\n" +
    "      </div>\n" +
    "   </div>\n" +
    "   <div class=\"comments\">\n" +
    "      <div class=\"comment\"\n" +
    "            ng-repeat=\"comment in issueCtrl.issue.tr_comments\">\n" +
    "         <img class=\"commenter\"\n" +
    "               ng-src=\"{{comment.user.avatar_url}}\"/>\n" +
    "         <h4>\n" +
    "            <em>{{comment.user.login}}</em> commented:\n" +
    "         </h4>\n" +
    "         <div class=\"comment-body\"\n" +
    "               ng-bind-html=\"comment.body_html\">\n" +
    "         </div>\n" +
    "      </div>\n" +
    "   </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("issue_filters/issue_filter.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("issue_filters/issue_filter.tpl.html",
    "<div id=\"issue-filters-drawer\"\n" +
    "     ng-controller=\"IssueFilterCtrl as filterCtrl\"\n" +
    "     ng-init=\"filterCtrl.init()\" >\n" +
    "\n" +
    "  <div class=\"drawer\" class=\"hide\" ng-class=\"{show: fitlerCtrl.showDrawer,\n" +
    "                                             hide: !fitlerCtrl.showDrawer}\" >\n" +
    "    <button id=\"filter-toggle-btn\"\n" +
    "            ng-click=\"fitlerCtrl.showDrawer = !fitlerCtrl.showDrawer\" >\n" +
    "      <span ng-if=\"fitlerCtrl.showDrawer\"><i class=\"icon-caret-right\"></i></span>\n" +
    "      <span ng-if=\"!fitlerCtrl.showDrawer\"><i class=\"icon-caret-left\"></i></span>\n" +
    "    </button>\n" +
    "    <h1>Filters</h1>\n" +
    "    <div class=\"content\">\n" +
    "      <ul >\n" +
    "        <li ng-click=\"filterCtrl.setFilter('owner', sessionModel.user.login)\"\n" +
    "            ng-class=\"{active: issueFilters.owner == sessionModel.user.login}\">\n" +
    "          Assigned to Me\n" +
    "          <i class=\"icon-remove\"></i>\n" +
    "        </li>\n" +
    "        <li ng-click=\"filterCtrl.setFilter('reviewer', sessionModel.user.login)\"\n" +
    "            ng-class=\"{active: issueFilters.reviewer == sessionModel.user.login}\">\n" +
    "          Reviewed by Me\n" +
    "          <i class=\"icon-remove\"></i>\n" +
    "        </li>\n" +
    "        <li ng-click=\"filterCtrl.setFilter('buildFailing', true)\"\n" +
    "            ng-class=\"{active: issueFilters.buildFailing}\">\n" +
    "          Failing Build\n" +
    "          <i class=\"icon-remove\"></i>\n" +
    "        </li>\n" +
    "      </ul>\n" +
    "      <h3>Collaborator</h3>\n" +
    "      <ul class=\"collaborator\">\n" +
    "        <li class=\"avatar\"\n" +
    "            ng-repeat=\"user in repoModel.assignees | filter:{login: '!'+sessionModel.user.login}\"\n" +
    "            ng-click=\"filterCtrl.setFilter('owner', user.login)\"\n" +
    "            ng-class=\"{active: issueFilters.owner == user.login}\" >\n" +
    "          <img ng-src=\"{{user.avatar_url}}\" ng-title=\"{{user.login}}\" />\n" +
    "        </li>\n" +
    "      </ul>\n" +
    "      <h3>Milestone</h3>\n" +
    "      <ul>\n" +
    "        <li ng-repeat=\"milestone in repoModel.milestones\"\n" +
    "            ng-click=\"filterCtrl.setFilter('milestone', milestone.title)\"\n" +
    "            ng-class=\"{active: issueFilters.milestone == milestone.title}\" >\n" +
    "          {{milestone.title}}\n" +
    "          <i class=\"icon-remove\"></i>\n" +
    "        </li>\n" +
    "      </ul>\n" +
    "      <h3>Label</h3>\n" +
    "      <ul>\n" +
    "        <li ng-repeat=\"label in repoModel.labels | nonColumnLabels\"\n" +
    "            ng-click=\"filterCtrl.toggleArrayFilter('labels', label.name)\"\n" +
    "            ng-class=\"{active: issueFilters.labels.indexOf(label.name) >= 0}\" >\n" +
    "          <span class=\"color-preview\"\n" +
    "                style=\"background-color: #{{label.color}}\"></span>\n" +
    "          {{label.name}}\n" +
    "          <i class=\"icon-remove\"></i>\n" +
    "        </li>\n" +
    "      </ul>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("login/create_token.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("login/create_token.tpl.html",
    "<class=\"modal-header\">\n" +
    "  <h3>Create Authentication Token</h3>\n" +
    "</h1>\n" +
    "\n" +
    "<div class=\"modal-body\">\n" +
    "  <p>A token is required to use Trestle.  May we create one for you?</p>\n" +
    "  <p class=\"muted\">\n" +
    "    The token will be added to GitHub with the description of \"trestle\".  If at any point you wish to revoke Trestles access to your account simply delete that token from your GitHub account.  If later on you want to use trestle again we will simply ask to creat the token then and our feelings wont be hurt.\n" +
    "  </p>\n" +
    "\n" +
    "</div>\n" +
    "<div class=\"modal-footer\">\n" +
    "  <button ng-click=\"$close('create')\"\n" +
    "          class=\"btn btn-primary\">Create Token</button>\n" +
    "  <button ng-click=\"$dismiss('cancel')\"\n" +
    "          class=\"btn\">Cancel</button>\n" +
    "</div>\n" +
    "\n" +
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
    "            <input autofocus type=\"search\" placeholder=\"Search\" ng-model=\"repoSearchText\"\n" +
    "                   class=\"search-query\" ></input>\n" +
    "          </div>\n" +
    "\n" +
    "          <ol class=\"org-list\">\n" +
    "            <li ng-repeat=\"(owner, repos) in toolbarCtrl.allRepos\">\n" +
    "              <h3 class=\"muted\" >{{owner}}</h3>\n" +
    "              <ol class=\"repo-list\" >\n" +
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
    "            title=\"Refresh All Issues\"\n" +
    "            ng-click=\"toolbarCtrl.refreshRepo()\">\n" +
    "      <i class=\"icon-refresh\"\n" +
    "         ng-class=\"{ 'icon-spin': toolbarCtrl.isRefreshing }\"></i>\n" +
    "    </button>\n" +
    "\n" +
    "    <button class=\"pull-right btn\"\n" +
    "            title=\"Mark All Viewed\"\n" +
    "            ng-click=\"toolbarCtrl.markAllRead()\">\n" +
    "      <i class=\"icon-check\"></i>\n" +
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
