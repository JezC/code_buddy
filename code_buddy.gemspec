# -*- encoding: utf-8 -*-
$:.push File.expand_path("../lib", __FILE__)
require "code_buddy/version"

Gem::Specification.new do |s|
  s.name        = "code_buddy"
  s.version     = CodeBuddy::VERSION
  s.platform    = Gem::Platform::RUBY
  s.authors     = ['Pat Shaughnessy, Alex Rothenberg, Daniel Higginbotham']
  s.email       = ['pat@patshaughnessy.net, alex@alexrothenberg.com, daniel@flyingmachinestudios.com']
  s.homepage    = "http://github.com/patshaughnessy/code_buddy"
  s.summary     = %q{See the Ruby code running in your app.}
  s.description = %q{See the Ruby code running in your app.}

  s.rubyforge_project = "code_buddy"

  s.files         = `git ls-files`.split("\n")
  s.test_files    = `git ls-files -- {test,spec,features}/*`.split("\n")
  s.executables   = `git ls-files -- bin/*`.split("\n").map{ |f| File.basename(f) }
  s.require_paths = ["lib"]

  s.add_dependency             'rack'
  s.add_dependency             'sinatra',       '~> 1.1.0'
  s.add_dependency             'json_pure',     '~> 1.4.6'
  s.add_dependency             'coderay',       '~> 0.9.6'

  s.add_development_dependency 'rake',          '~> 0.8.7'
  s.add_development_dependency 'rspec',         '~> 2.2.0'
  s.add_development_dependency 'mocha',         '~> 0.9.10'
  s.add_development_dependency 'cucumber',      '~> 0.9.4'
  s.add_development_dependency 'aruba',         '~> 0.2.2'
  # s.add_development_dependency 'capybara'
  # s.add_development_dependency 'akephalos'
end
