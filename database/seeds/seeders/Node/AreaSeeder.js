const areaData = require('./../../data/Node/Area.json');
const Area = require('./../../../../app/models/Node/Area/Area');

async function seedAreas(items) {
  // let area = await Area.where({'name': 'test'}).fetch();
  // console.log(area);
  try {
    await Promise.all(items.map(async (itemData) => {

      let area = await new Area(itemData).fetch({require: false});

      if (!area) {
        await new Area(itemData).save();
        console.log(`Successfully insert Area record with ${itemData.slug} - ${itemData.name}`)
      }

    }));
  } catch (e) {
    console.log(e);
  }

  console.log('Done');
  process.exit(1);
}

seedAreas(areaData);
