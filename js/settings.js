const lightspeed = require(__dirname + '/js/lightspeed')
const colorPicker = require('a-color-picker');


showStatusses();

async function showStatusses() {
    var { shipments, orders, products, customStatuses } = await lightspeed.getLightspeedData();
    console.log(customStatuses)
    for (let i = 0; i < customStatuses.length; i++) {
        addStatus(customStatuses[i]);
    }

    var addButton = $('<button class="addStatus">Status toevoegen</button>').appendTo('#customStatusSettings');
    addButton.click(() => {
        let popup = $('#customStatusPopup');
        console.log('bruh');
        popup.find('h2').eq(0).text('Status toevoegen');
        popup.find('.colorPicker').eq(0).empty();
        colorPicker.from(popup.find('.colorPicker').eq(0));
        popup.find('.save').off('click').click(()=>{
            let color = popup.find('.a-color-picker-rgbhex').eq(0).find('input').eq(0).val();
            let title = popup.find('.title').val();
            console.log({color, title});
            let customStatus = lightspeed.addCustomStatus(color, title);
            addStatus(customStatus);
            popup.removeClass('visible')
        })

        popup.addClass('visible');
    })
}

async function addStatus(customStatus){
    let div = $(`<div class='customStatus'><span><h3 style='color:${customStatus.color}'>${customStatus.title}</h3><a class='delete'><i class='fas fa-trash'></i></a><a class='edit'><i class='fas fa-edit'></i></a></span></div></div>`).appendTo('#customStatusSettings');
        div.find('.edit').eq(0).click(() => {
            let popup = $('#customStatusPopup');
            popup.find('h2').eq(0).text('Status aanpassen');
            popup.find('.title').eq(0).val(customStatus.title);
            popup.find('.colorPicker').eq(0).empty().attr('acp-color', customStatus.color);
            colorPicker.from(popup.find('.colorPicker').eq(0));

            popup.find('.save').off('click').click(()=>{
                let color = popup.find('.a-color-picker-rgbhex').eq(0).find('input').eq(0).val();
                let title = popup.find('.title').val();
                if(title === customStatus.title && color == customStatus.color){
                    popup.removeClass('visible')
                }else{
                    customStatus.title = title;
                    customStatus.color = color;
                    lightspeed.updateCustomStatus(customStatus);
                    div.find('h3').eq(0).text(title).css('color', color);
                    popup.removeClass('visible')
                }
            });

            popup.addClass('visible');
        })
}