class User
  attr_accessor :_id, :e, :d, :c_at, :u_at

  def self.all(account_id)
    @@db.collection("users_#{account_id}").find()
  end
end
