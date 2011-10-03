class Session
  attr_accessor :_id, :id, :email, :name, :c_at, :u_at

  def self.build(params={})
    session = Session.new

    session._id = params["_id"] if params["_id"].present?
    session.id = params["i"] if params["i"].present?
    session.email = params["e"] if params["e"].present?
    session.name = params["d"] if params["d"].present?
    session.c_at = params["c_at"] if params["c_at"].present?
    session.u_at = params["u_at"] if params["u_at"].present?
    session
  end

  def analytics(account_id)
    Analytic.for_session(account_id, self._id)
  end

  def display
    self.name || self.email || (self.id.nil? ? nil : "Id: #{self.id}") || self._id
  end

  def self.all(account_id)
    sessions = []

    sessions_params = @@db.collection("sessions_#{account_id}").find().sort(["u_at", -1])
    sessions_params.each do |params|
      session = Session.build(params)
      sessions.push(session)
    end

    sessions
  end

  def self.find(account_id, id)
    id = BSON::ObjectId.from_string(id) if id.is_a?(String)
    params = @@db.collection("sessions_#{account_id}").find({_id: id}).first
    Session.build(params)
  end
end
