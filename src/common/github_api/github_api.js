/**
 @ngdoc overview
 @name  github.api

 @description
 Module which provides an interface for the GitHub Api.
 */
angular.module('github.api', ['restangular'])

.factory('GitHubRestangular',  function(Restangular) {
   return Restangular.withConfig(function(RestangularConfigurer) {
      RestangularConfigurer.setBaseUrl('https://api.github.com');
   });
})

/**
 @ngdoc service
 @name  github.api.gh

 @description
 Angular service `gh` which provides tools for accessing GitHub API's
 */

.service('gh', function gh($q, GitHubRestangular) {
   var
   response_extractors  = [],
   token;

   // Extend the API set the access token when we have one
   GitHubRestangular.setFullRequestInterceptor(function(element, operation, what,
                                                        url, headers, params) {
      var options = {
         element:   element,
         operation: operation,
         what:      what,
         url:       url,
         headers:   headers,
         params:    params
      };

      // Ensure that access token is always available
      _.defaults(options.params, {access_token: getAccessToken()});

      return options;
   });

   /**
    @ngdoc    function
    @name     addResponseExtractor
    @methodOf github.api.gh

    @description
    XXX

    @param {function} handler Function to invoke with the current response.
           The parameters for the function are the same as
           `Restangular.setResponseExtractor` handlers.
    */
   this.addResponseExtractor = function(handler) {
      response_extractors.push(handler);
   };

   // Configure Restangular to allows us to mutate the GitHub results as needed.
   GitHubRestangular.setResponseExtractor(function(response, operation, what,
                                                   url, headers, params) {
      var handler_args = arguments;

      _.each(response_extractors, function(handler) {
         var handler_res = handler.apply(null, handler_args);
         if (handler_res) {
            response = handler_res;
         }
      });

      // Return the response
      return response;
   });


   /**
    @ngdoc function
    @name  getAccessToken
    @methodOf github.api.gh

    @description
    Helper which will read the token from storage if they token is not
    currently set.

    @private

    @returns {string} The token or falsy if not found.
    */
   function getAccessToken() {
      return token;
   }

   /**
    @ngdoc    function
    @name     hasAccessToken
    @methodOf github.api.gh

    @description
    Predicate determining if the service has token to use when accessing
    resources on GitHub.
    */
   this.hasAccessToken = function() {
      return !!token;
   };

   /**
    @ngdoc    function
    @name     setAccessToken
    @methodOf github.api.gh

    @description
    Allows setting the API token to use when communicating with the GitHub API.

    @param {string} newToken The new token to use for the service.  Pass a falsy
           value to clear the token.
    */
   this.setAccessToken = function(newToken) {
      // Update our internal reference to the token
      token = newToken ? newToken : null;
   };

   this.getUserDetails = function() {
      return GitHubRestangular.one('user').get();
   };

   /**
    @ngdoc    function
    @name     listRepoAssignees
    @methodOf github.api.gh

    @description
    Returns the list if users which can be assigned to an issue

    @see http://developer.github.com/v3/issues/assignees/

    @param {string} owner The owner of the repository
    @param {string} repo  The name of the repository

    @returns {Promise} When resolved the list of all assignees
    */
   this.listRepoAssignees = function(owner, repo) {
      var url = ['repos', owner, repo, 'assignees'].join('/');
      return GitHubRestangular.one(url).get({per_page: 100});
   };

   /**
    @ngdoc    function
    @name     listRepoIssues
    @methodOf github.api.gh

    @description
    Returns the list if issues for a repository.

    - [ ] handle the case where there are more then one page of issues.

    @see http://developer.github.com/v3/issues/#list-issues-for-a-repository

    @param {string} owner             The owner of the repository
    @param {string} repo              The name of the repository
    @param {array.string} args.labels If set then the list of labels to return
           issues for.

    @returns {Promise} When resolved the list of all issues.
    */
   this.listRepoIssues = function(owner, repo, args) {
      // XXX look at how to get more then 100 uses
      // - paging
      var headers = {
         Accept: 'application/vnd.github.full+json'
      };
      return GitHubRestangular
         .one(['repos', owner, repo, 'issues'].join('/'))
         .get(angular.extend(args || {}, {per_page: 100}), headers);
   };

   this.listRepos = function() {
      return GitHubRestangular
         .one(['user', 'repos'].join('/'))
         .get({per_page: 100});
   };

   this.listOrgs = function() {
      return GitHubRestangular
         .one(['user', 'orgs'].join('/'))
         .get({per_page: 100});
   };

   this.listOrgRepos = function(org) {
      return GitHubRestangular
         .one(['orgs', org, 'repos'].join('/'))
         .get({per_page: 100});
   };

   this.listAllOrgRepos = function() {
      var me = this;

      var d = $q.defer();

      // Get all of the users orginizations
      var p = this.listOrgs();

      // Once we have all of the orgs
      // - Loop over each one and retrieve the repos for the org
      p.then(function(orgs) {
         // Kick of a search for each org in parallel
         var all_orgs_repos = $q.all(_.map(orgs, function(org) {
            return me.listOrgRepos(org.login);
         }));

         // Fire our deferred when the calls finish
         all_orgs_repos.then(function(repos) {
            // Flatten all of the repos into one array
            var all_repos = _.flatten(repos);

            // Resolve the deferred
            d.resolve(all_repos);
         }, d.reject);
      });

      // Return our internal deferred so that anyone waiting on this method
      // gets all of the results.
      return d.promise;
   };

   this.getRepos = function(owner, repo) {
      return GitHubRestangular
         .one(['repos', owner, repo].join('/'))
         .get();
   };

   this.listAllRepos = function() {
      var me = this;

      return $q.all([
         // We want all of the users repos
         me.listRepos(),
         // And all of the repos their orgs have also
         me.listAllOrgRepos()
      ]).then(function(repos) {
         // Merge all of the repos together
         return _.flatten(repos);
      }, function onError() {
         console.error(arguments);
      });
   };

   this.extractRepoInfo = function(url) {
      var matches = /https:\/\/github\.com\/([^/]*)\/([^/]*)/.exec(url);
      if (!matches) {throw new Error('Url did match GitHub syntax');}
      return {owner: matches[1], repo: matches[2]};
   };

   this.getIssue = function(owner, repo, issueNumber) {
      return GitHubRestangular
         .one(['repos', owner, repo, 'issues', issueNumber].join('/'))
         .get();
   };

   this.updateIssue = function(owner, repo, issueNumber, fields) {
      return GitHubRestangular
         .one(['repos', owner, repo, 'issues', issueNumber].join('/'))
         .patch(fields);
   };

   /**
    @ngdoc    function
    @name     createIssue
    @methodOf github.api.gh

    @description
    Creates a new issue for the repository with the given settings.

    @param {string} owner The owner of the repository
    @param {string} repo  The name of the repository
    @param {string} issue.title The title to give to the new issue
    @param {string} issue.body A description of the issue
    @param {int} issue.milestone If set the id of a milestone to assign the issue too.
    @param {array.string} issue.labels If set then the label names to assign to
                          the new issue.

    @see http://developer.github.com/v3/issues/#create-an-issue

    @returns {Promise} When resolved the list of all issues.
    */
   this.createIssue = function(owner, repo, issue) {
      if (!issue.title) {
         throw new Error('All issues require a title');
      }

      return GitHubRestangular
         .all(['repos', owner, repo, 'issues'].join('/'))
         .post(issue);
   };

   /**
   * Return list of all comments on the issue.
   */
   this.getIssueComments = function(owner, repo, issueNumber, options) {
      var headers = {};
      if (options.asHtml) {
         headers.Accept = 'application/vnd.github.html+json';
      }
      return GitHubRestangular
         .one(['repos', owner, repo, 'issues', issueNumber, 'comments'].join('/'))
         .get({}, headers);
   };

   /**
   * Return list of all pull comments (the code review ones)
   */
   this.getPullComments = function(owner, repo, issueNumber, options) {
      var headers = {};
      if (options.asHtml) {
         headers.Accept = 'application/vnd.github.html+json';
      }
      return GitHubRestangular
         .one(['repos', owner, repo, 'pulls', issueNumber, 'comments'].join('/'))
         .get({}, headers);
   };

   /**
    @ngdoc    function
    @name     searchIssues
    @method   searchIssues
    @methodOf github.api.gh

    @description
    Allows for searching the issues the user has access based on certain fields.

    This API is in flux and as such the method may break in the furture.

    http://developer.github.com/v3/search/#search-issues

    @param {string} options.title When set only issues containing this string
           are returned.
    */
   this.searchIssues = function(options) {
      // XXX: Would this be faster since it is a single repos?
      //  - /legacy/issues/search/:owner/:repository/:state/:keyword
      //  http://developer.github.com/v3/search/legacy/#search-issues
      //
      // Build up the search string by looking at the supplied options
      var query = '';
      if (options.title) {
         query = query +options.title+'+in:title';
      }
      return GitHubRestangular.one('search/issues').get(
                                   {q: query},
                                   {'Accept': 'application/vnd.github.preview'});
   };


   this.getPull = function(owner, repo, issueNumber) {
      return GitHubRestangular
         .one(['repos', owner, repo, 'pulls', issueNumber].join('/'))
         .get();
   };

   this.createPullFromIssue = function(owner, repo, issueNumber, base, head) {
      return GitHubRestangular
         .all(['repos', owner, repo, 'pulls'].join('/'))
         .post(JSON.stringify({issue: issueNumber, base: base, head: head }));
   };

   this.getStatus = function(owner, repo, ref) {
      return GitHubRestangular
         .one(['repos', owner, repo, 'statuses', ref].join('/'))
         .get();
   };

   this.listMilestones = function(owner, repo, args) {
      return GitHubRestangular
         .one(['repos', owner, repo, 'milestones'].join('/'))
         .get(_.defaults({}, args, {state: 'open'}));
   };

   this.listLabels = function(owner, repo) {
      return GitHubRestangular
         .one(['repos', owner, repo, 'labels'].join('/'))
         .get();
   };

   this.getBranches = function(owner, repo) {
      return GitHubRestangular
         .one(['repos', owner, repo, 'branches'].join('/'))
         .get();
   };

   this.compareCommits = function(owner, repo, base, head) {
      return GitHubRestangular
         .one(['repos', owner, repo, 'compare', base + '...' + head].join('/'))
         .get();
   };

   /**
    Helper function to convert GitHub's multiple string base 64 encoding into
    the actual string it represents.
    */
   function ghB64Decode(str) {
      // Decode each line seperatly and join them as a single string
      var lines = _.map(str.split('\n'), function(b64Str) {
         return window.atob(b64Str);
      });
      return lines.join('');
   }

   /**
    @ngdoc function
    @name  getFile
    @descrption
    Downloads a file from Github and returns the file contents as a string.

    @method   getFile
    @methodOf github.api.gh

    @param {string} owner The owner of the repository to download the file from
    @param {string} repo The name of the repository to download the file from
    */
   this.getFile = function(owner, repo, path) {
      return GitHubRestangular.one(['repos', owner, repo, 'contents', path].join('/')).get()
         .then(function(file) {
            return ghB64Decode(file.content);
         });
   };

});
