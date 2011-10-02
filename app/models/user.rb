class User
  attr_accessor :_id, :email, :display, :c_at, :u_at

  def self.build(params={})
    user = User.new

    user._id = params["_id"] if params["_id"].present?
    user.email = params["e"].to_i if params["e"].present?
    user.display = params["d"] if params["d"].present?
    user.c_at = params["c_at"] if params["c_at"].present?
    user.u_at = params["u_at"] if params["u_at"].present?
    user
  end

  def analytics(account_id)
    Analytic.for_user(account_id, self._id)
  end

  def self.all(account_id)
    users = []

    users_params = @@db.collection("users_#{account_id}").find()
    users_params.each do |params|
      user = User.build(params)
      users.push(user)
    end

    users
  end

  def self.find(account_id, id)
    id = BSON::ObjectId.from_string(id) if id.is_a?(String)
    params = @@db.collection("users_#{account_id}").find({_id: id}).first
    User.build(params)
  end
end
