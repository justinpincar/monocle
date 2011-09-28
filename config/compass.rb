project_type = :rails

# Set this to the root of your project when deployed:
http_path = "/"

if Rails.env.production?
  # This is to make Heroku happy since you can't write to public/stylesheets on Heroku
  css_dir = "tmp/stylesheets/compiled"
else
  css_dir = "public/stylesheets/compiled"
end

sass_dir = "app/stylesheets"
