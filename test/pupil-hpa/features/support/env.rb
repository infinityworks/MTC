require 'active_support'
require 'capybara'
require 'capybara/cucumber'
require 'require_all'
require 'rspec'
require 'selenium-webdriver'
require 'site_prism'
require 'pry'
require 'capybara/poltergeist'
require 'numbers_in_words'
require 'mongo'
require 'waitutil'
require 'tiny_tds'
require 'show_me_the_cookies'
require 'httparty'
require_relative '../../features/support/browserstack_driver_helper'
require_relative '../../features/support/request_helper'
require 'azure/storage/table'
require 'azure/storage/queue'
require 'azure/storage/blob'

require_relative 'helpers'
include Helpers

ENV["ADMIN_BASE_URL"] ||= 'http://localhost:3001'
ENV["PUPIL_API_BASE_URL"] ||= 'http://localhost:3003'
ENV['WAIT_TIME'] ||= '20'


Capybara.configure do |config|
  config.default_driver = ENV["DRIVER"].to_sym
  config.app_host = ENV["BASE_URL"] ||= 'http://localhost:4200'
  config.exact = true
  config.ignore_hidden_elements = false
  config.visible_text_only = true
end

Capybara.register_driver(:chrome) do |app|
  Capybara::Selenium::Driver.new(app, browser: :chrome)
end

Capybara.register_driver :poltergeist do |app|
  Capybara::Poltergeist::Driver.new(app, js_errors: false, timeout: 60)
end

Capybara.register_driver :headless_chrome do |app|
  args = ["--window-size=1280,1696", "--disable-infobars", "--disable-notifications", "--no-sandbox", "--headless", "--disable-gpu"]
  Capybara::Selenium::Driver.new(app, {:browser => :chrome, :args => args})
end

Dir.mkdir("reports") unless File.directory?("reports")
Capybara.javascript_driver = ENV["DRIVER"].to_sym

Mongo::Logger.logger.level = ::Logger::FATAL

if ENV['MONGO_CONNECTION_STRING']
  CLIENT = Mongo::Client.new(ENV['MONGO_CONNECTION_STRING'])
else
  CLIENT = Mongo::Client.new('mongodb://mongo/mtc')
end
sleep 20
database = ENV['SQL_DATABASE'] || 'mtc'
server = ENV['SQL_SERVER'] || 'localhost'
port =  ENV['SQL_PORT'] || 1433
admin_user = ENV['SQL_ADMIN_USER'] || 'sa'
admin_password = ENV['SQL_ADMIN_USER_PASSWORD'] || 'Mtc-D3v.5ql_S3rv3r'

begin
  SQL_CLIENT = TinyTds::Client.new(username: admin_user,
                                   password: admin_password,
                                   host: server,
                                   port: port,
                                   database: database)
rescue TinyTds::Error => e
  abort 'Test run failed due to - ' + e.to_s
end

SQL_CLIENT.execute('SET ANSI_NULLS ON').do
SQL_CLIENT.execute('SET CURSOR_CLOSE_ON_COMMIT OFF').do
SQL_CLIENT.execute('SET ANSI_NULL_DFLT_ON ON').do
SQL_CLIENT.execute('SET IMPLICIT_TRANSACTIONS OFF').do
SQL_CLIENT.execute('SET ANSI_PADDING ON').do
SQL_CLIENT.execute('SET QUOTED_IDENTIFIER ON').do
SQL_CLIENT.execute('SET ANSI_WARNINGS ON').do
SQL_CLIENT.execute('SET CONCAT_NULL_YIELDS_NULL ON').do


if File.exist?('../../admin/.env')
  credentials = File.read('../../admin/.env').split('AZURE_STORAGE_CONNECTION_STRING').last.split(';')
  @account_name = credentials.find{|a| a.include? 'AccountName' }.gsub('AccountName=','')
  @account_key = credentials.find{|a| a.include? 'AccountKey' }.gsub('AccountKey=','')
else
  credentials = ENV['AZURE_STORAGE_CONNECTION_STRING'].split('AZURE_STORAGE_CONNECTION_STRING').last.split(';')
  @account_name = credentials.find{|a| a.include? 'AccountName' }.gsub('AccountName=','')
  @account_key = credentials.find{|a| a.include? 'AccountKey' }.gsub('AccountKey=','')
end

ENV["AZURE_ACCOUNT_NAME"] ||= @account_name
ENV["AZURE_ACCOUNT_KEY"] ||= @account_key

fail 'Please set the env var AZURE_STORAGE_CONNECTION_STRING' if ENV["AZURE_ACCOUNT_NAME"].nil?
fail 'Please set the env var AZURE_STORAGE_CONNECTION_STRING' if ENV["AZURE_ACCOUNT_KEY"].nil?

AZURE_TABLE_CLIENT = Azure::Storage::Table::TableService.create(storage_account_name: ENV["AZURE_ACCOUNT_NAME"], storage_access_key: ENV["AZURE_ACCOUNT_KEY"])
AZURE_QUEUE_CLIENT = Azure::Storage::Queue::QueueService.create(storage_account_name: ENV["AZURE_ACCOUNT_NAME"], storage_access_key: ENV["AZURE_ACCOUNT_KEY"])
AZURE_BLOB_CLIENT = Azure::Storage::Blob::BlobService.create(storage_account_name: ENV["AZURE_ACCOUNT_NAME"], storage_access_key: ENV["AZURE_ACCOUNT_KEY"])

Capybara.visit Capybara.app_host