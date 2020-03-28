const lightspeed = require(__dirname + '/js/lightspeed')
const colorPicker = require('a-color-picker');


showStatusses();

async function showStatusses() {
    var { shipments, orders, products, customStatuses } = await lightspeed.getLightspeedData();
    console.log(customStatuses)
    for (let i = 0; i < customStatuses.length; i++) {
        let div = $(`<div class='customStatus'><span><h3 style='color:${customStatuses[i].color}'>${customStatuses[i].title}</h3><a class='delete'><i class='fas fa-trash'></i></a><a class='edit'><i class='fas fa-edit'></i></a></span></div></div>`).appendTo('#customStatusSettings');
        div.find('.edit').eq(0).click(() => {
            let popup = $('#customStatusPopup');
            popup.find('.title').eq(0).val(customStatuses[i].title);
            popup.find('.colorPicker').eq(0).empty().attr('acp-color', customStatuses[i].color);
            colorPicker.from(popup.find('.colorPicker').eq(0));

            popup.find('.save').off('click').click(()=>{
                let color = popup.find('.a-color-picker-rgbhex').eq(0).find('input').eq(0).val();
                let title = popup.find('.title').val();
                if(title === customStatuses[i].title && color == customStatuses[i].color){
                    popup.removeClass('visible')
                }else{
                    console.log(popup.find('.title').val(), customStatuses[i].title, popup.find('.a-color-picker-rgbhex').eq(0).find('input').eq(0).val(), customStatuses[i].color)
                    customStatuses[i].title = title;
                    customStatuses[i].color = color;
                    lightspeed.updateCustomStatus(customStatuses[i]);
                    div.find('h3').eq(0).text(title).css('color', color);
                    popup.removeClass('visible')
                }
            });

            popup.addClass('visible');
        })
    }
}