Monocle::Application.routes.draw do
  devise_for :accounts

  resources :accounts, :only => [:show, :new, :create, :edit, :update]
  resources :events, :only => [:index, :create, :show]
  resources :users, :only => [:index, :show]

  match '/monocle' => 'monocle#index', :as => :monocle

  match '/about' => 'home#about', :as => :about
  match '/jobs' => 'home#jobs', :as => :jobs
  match '/press' => 'home#press', :as => :press
  match '/privacy' => 'home#privacy', :as => :privacy
  match '/team' => 'home#team', :as => :team
  match '/terms' => 'home#terms', :as => :terms

  root :to => "home#index"
end
