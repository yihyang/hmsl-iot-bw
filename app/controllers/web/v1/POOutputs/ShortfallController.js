const rootPath = './../../../../..';
const fs = require('fs');
const moment = require('moment')
const PoOutput = require(`${rootPath}/app/models/PoOutput/PoOutput`)
const csv = require('csv-parser');

let upload = async function(req, res) {
  let user = req.user;
  let userId = null;
  if (user) {
    userId = user.id;
  }

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', async function(data) {

      if(data['PO Number'] == '' || data['Material Number'] == '') {
        return;
      }
      let existingPoOutput = await new PoOutput({
          po_number: data['PO Number'],
          material_number: data['Material Number']
      }).fetch({require: false});


      if(!existingPoOutput) {
        let targetCompletionDate = moment(data['Target Completion Date'], "DD/MM/YYYY").toISOString();

        let savingData = {
          user_id: userId,
          po_number: data['PO Number'],
          material_number: data['Material Number'],
          material_description: data['Material Description'],
          target_quantity: data['Target Quantity'],
          unit: data['Unit'],
          target_completion_date: targetCompletionDate
        }

        await new PoOutput(savingData).save();
      }
    })
    .on('end', function() {
      res.json({message: 'Successfully set uploaded data.'})
    });
}

module.exports = {
  upload
}
