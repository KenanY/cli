request = require 'request'
_ = require 'lodash'
q = require 'bluebird'
git = require 'gulp-git'
fs = require('fs-extra')
shell = require('shelljs')
Git = require 'git-wrapper'

Authorizer = require './authorizer'
Urls = require './urls'
Deployer = require './deployer'

Log = require './log'
Color = require './color'

module.exports =
class Pusher
  constructor: (@name, @target) ->
    @git = new Git()

    authorizer = new Authorizer

    @token_params =
      api_token: authorizer.accessToken()

    # check if closeheat is github authorized
    # - if not, force auth via link http://closeheat.com/authorize-github
    # create an app with repo, hooks
    # add, commit files and push to repo as master (do auto deploy)

  push: ->
    @getGithubUsername().then((username) =>
      Log.inner("Using Github username: #{Color.orange(username)}")
      Log.spin('Creating closeheat app and Github repository.')
      @createAppInBackend().then (resp) =>
        Log.stop()
        Log.inner("Created both with name '#{@name}'.")

        @pushFiles(username)
    ).catch (err) ->
      Log.error(err)

  handleCreationError: (error) =>
    console.log(error)

  githubNotAuthorized: =>
    Log.error('Github not authorized')
    Log.p "We cannot set you up for deployment because you did not authorize Github."
    Log.br()
    Log.p "Visit #{Urls.authorizeGithub()} and rerun the command."

  createAppInBackend: =>
    new q (resolve, reject) =>
      request { url: Urls.createApp(), qs: _.merge(repo_name: @name, @token_params), method: 'post' }, (err, resp) =>
        return reject(err) if err

        resolve(resp)

  getGithubUsername: ->
    new q (resolve, reject) =>
      request url: Urls.currentUserInfo(), qs: @token_params, method: 'get', (err, resp) =>
        return reject(err) if err

        try
          user_info = JSON.parse(resp.body).user
        catch e
          return Log.error('Backend responded with an error.')

        if user_info['github_token']
          resolve(user_info['github_username'])
        else
          @githubNotAuthorized()

  pushFiles: (username) =>
    shell.cd(@target)

    @initGit().then =>
      @addRemote(username).then =>

      new Deployer().deploy("#{@target}/**").then ->
        shell.cd('..')

  addRemote: (username) =>
    new q (resolve, reject) =>
      git_url = "git@github.com:#{username}/#{@name}.git"

      @git.exec 'remote', ['add', 'origin', git_url], (err, resp) ->
        return reject(err) if err

        resolve()

  initGit: =>
    new q (resolve, reject) =>
      @git.exec 'init', [@target], (err, resp) ->
        return reject(err) if err

        resolve()
