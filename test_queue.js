const { addJob } = require("./queue_add_job")

let main = async () => {
  await addJob('oee_rework', {})
}

main()
