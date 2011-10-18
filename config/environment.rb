# Load the rails application
require File.expand_path('../application', __FILE__)

# Initialize the rails application
Monocle::Application.initialize!

ActionMailer::Base.smtp_settings = {
  :user_name      => 'sidespin',
  :password       => 'sidespin_grid',
  :domain         => 'sidesp.in',
  :address        => 'smtp.sendgrid.net',
  :port           => '587',
  :authentication => :plain,
  :enable_starttls_auto => true
}
