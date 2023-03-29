/*tamam*/
const mongoose = require('mongoose')
const UserSchema = new mongoose.Schema(
	{
		user_email: { type: String, required: true, trim: true, unique: true },
		users: [{
			first_name: { type: String, required: true, trim: true },
			last_name: { type: String, required: true, trim: true },
			birthday_day: { type: String, required: true, trim: true },
			birthday_month: { type: String, required: true, trim: true },
			birthday_year: { type: String, required: true, trim: true }
		}]
	},
	{ collection: 'birthday_info_collection' }
)

const birthday_info_user_schema = mongoose.model('UserSchema', UserSchema)

module.exports = birthday_info_user_schema