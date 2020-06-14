const rootPath = './../../..'
const User = require(`${rootPath}/app/models/Account/User`);
const {
  respondSuccessWithData,
  respondError
} = require(`${rootPath}/app/helpers/response`)

async function authenticate(req, res) {
  let {
    username,
    password
  } = req.body;
  let result = await User.authenticate(username, password);

  if (!result) {
    res
      .status(401)
      .json(respondError("Unauthorized", "Invalid username and / or password combination provided", '401'));

    return
  }

  res
    .status(200)
    .json(respondSuccessWithData("Login Sucessful", "Succesfully logged in", result));
}

async function authenticateWithEmployeeId(req, res) {
  let {
    employee_id
  } = req.body;

  if (!employee_id) {
    res
      .status(422)
      .json(respondError("Employee ID", "Invalid employee ID provided", '422'));

    return
  }

  let result = await User.authenticateWithEmployeeId(employee_id);

  if (!result) {
    res
      .status(401)
      .json(respondError("Unauthorized", "Invalid employee ID provided", '401'));

    return
  }

  res
    .status(200)
    .json(respondSuccessWithData("Login Sucessful", "Succesfully logged in", result));
}

module.exports = {
  authenticate,
  authenticateWithEmployeeId
}
