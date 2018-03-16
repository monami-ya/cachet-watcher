const Cachet = require('cachet-node').Cachet;
const request = require('request');

const cachet = new Cachet({
    domain: process.env.CACHET_API_URL,
    token: {
      value: process.env.CACHET_API_KEY,
      headerOrQueryName: 'X-Cachet-Token'
    }
});

const fetch = (component) => new Promise((resolve, reject) => {
  request.get(component.link, (err, res, body) => {
    let result;
    if (err) {
      console.dir(err);
      /*
      result = cachet.createIncident({
          body: {
            component_id: component.id,
            name: 'Connection issue',
            message: 'Connection failed.',
            status: 1,
            visible: 1
          }
      });
      */
    } else if (res.statusCode >= 300) {
      result = cachet.createIncident({
          body: {
            component_id: component.id,
            name: 'Unexpected response.',
            message: `statusCode: ${res.statusCode}`,
            status: 1,
            visible: 1
          }
      });
    } else {
      result = Promise.all([
          cachet.getIncidents({
            coponentId: component.id
          }).then(x => x.body.data.map(x => cachet.updateIncidentById({
            incident: x.data.id,
            body: {
              status: 4,
              visible: 1
            }
          }))),
          cachet.updateComponentById({
              component: component.id,
              body: {
                status: 1
              }
      })]);
    };
    resolve(result);
  });
}).catch(x => console.dir(x.body.errors));


cachet.getComponents().then(x => x.body.data.filter(y => y.link.startsWith('http'))).then(x => x.map(fetch)).catch(console.dir);

