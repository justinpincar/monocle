Monocle::Application.routes.draw do
  devise_for :accounts, :controllers => { :sessions => "accounts/sessions" }

  resources :events, :only => [:index, :create, :show, :update, :destroy]
  resources :matrix, :only => [:index] do
    collection do
      get :preload_data
    end
  end
  resources :sessions, :only => [:index, :show]

  match '/account' => 'accounts#show', :as => :account
  match '/monocle' => 'monocle#index', :as => :monocle

  match '/about' => 'home#about', :as => :about
  match '/jobs' => 'home#jobs', :as => :jobs
  match '/press' => 'home#press', :as => :press
  match '/privacy' => 'home#privacy', :as => :privacy
  match '/team' => 'home#team', :as => :team
  match '/terms' => 'home#terms', :as => :terms

  match '/ma' => 'home#ma'

  root :to => "home#index"
end
