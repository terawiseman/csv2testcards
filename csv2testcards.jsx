/**
* csv�̓ǂݍ���
* @func ReadCSV
* @parm string fileName �ǂݍ��݂�����t�@�C���l�[���i�Ƃ������p�X�j
**/
function ReadCSV(fileName){
    var fileObj = new File(fileName);
    var csv = new Array();
    if(fileObj.open("r")){

        while(!fileObj.eof){
            csv.push(fileObj.readln().split(','));
             //debug//alert(fileObj.readln());
        }
        return csv;
    }else{
        alert("can't open "+fileName);
        return 0;
    }
}


/**
 * �X�}�[�g�I�u�W�F�N�g���J���āA�X�}�[�g�I�u�W�F�N�g����
 * �摜�𒣂�t����B
 * �Q�l�Fhttp://qiita.com/IDs011da/items/1388bdcf63e058bf8848
 * @func EditSmartobject
 * @param layer �ҏW�������X�}�[�g�I�u�W�F�N�g���C���[
 * @param func ���̃X�}�[�g���C���[���ł�肽������
**/
function EditSmartobject(layer,filePath){

    // �ꉞ���C���[�̎�ނ𔻕�
    // �X�}�[�g�I�u�W�F�N�g�ȊO�̃��C���[�Ȃ�A�������Ȃ�
    if(LayerKind.SMARTOBJECT == layer.kind){
        //alert("This Layer is SmartObject");
        var idAction = stringIDToTypeID( "placedLayerEditContents" );
        var idDesc = new ActionDescriptor();

        activeDocument.activeLayer = layer;
        executeAction(idAction, idDesc, DialogModes.NO);

        //���̃X�}�[�g���C���[�������ꂢ�ɂ���B
        layObj = activeDocument.artLayers.add();

        //���쐬�������̈ȊO�S���C���[�폜
        i = 0;
        do{
            if(layObj != activeDocument.artLayers[i]){
                activeDocument.artLayers[i].remove();
            }
            i++;
        }while(i <= activeDocument.artLayers.length);

        //�R�s�y������
        open(new File(filePath));
        activeDocument.selection.selectAll();
        activeDocument.activeLayer.copy();
        activeDocument.close(SaveOptions.DONOTSAVECHANGES);

        //�\��t�������āA���̌�\��t����̃L�����p�X�T�C�Y�ɍ��킹��
        activeDocument.activeLayer = activeDocument.paste();

        //�X�}�[�g�I�u�W�F�N�g��ۑ��A����B
        activeDocument.save();
        activeDocument.close(SaveOptions.DONOTSAVECHANGES);
    }else{
        alert("This layer is not SmartObject");
    }
}


/**
 * ���݂̃h�L�������g��psd�`���ŗ^����ꂽpath���ŕۑ�
 * @param doc �ۑ��Ώۂ̃h�L�������g
 * @param filePath �t�@�C���p�X
**/
function SavePsd(doc,filePath){

    //�ʖ��ۑ�
    //�Q�l�Fhttp://www.openspc2.org/book/PhotoshopCS6/easy/save/008/index.html

    var anothernameObj  = new File(filePath);
    var psdOpt = new PhotoshopSaveOptions();
    psdOpt.alphaChannels = true;
    psdOpt.annotations = true;
    psdOpt.embedColorProfile = false;
    psdOpt.layers = true;
    psdOpt.spotColors = false;
    doc.saveAs(anothernameObj, psdOpt, true, Extension.LOWERCASE);
}

/**
* �e�X�g�J�[�h��psd��png�f�[�^���쐬����B
* �ǂݍ��܂���e���v���[�g��psd�ƃJ�[�h�f�[�^�̂���csv�𓯂����O�ɂ��āA
* �����ɓǂݍ��܂��ĂˁI
* @function csv2png4testcard
* @param string foldername ������t�H���_�̂���ꏊ�̃p�X
* @param string filename �e���v���[�g��psd�ƃJ�[�h�f�[�^��csv�̖��O
**/
function csv2png4testcard(foldername,filename){
    //�������ʂ̉摜������t�H���_������I
    folderObj = new Folder(foldername+"/"+filename);
    folderObj.create();

    //png�p
    folderObj = new Folder(foldername+"/"+filename+"/png");
    folderObj.create();
    //�������ʂ̉摜������t�H���_������I
    folderObj = new Folder(foldername+"/"+filename+"/psd");
    folderObj.create();


    //csv�̓ǂݍ���
    var textdata = ReadCSV(foldername+"/"+filename+".csv");

    if(0 == textdata)return 0;
    //�e���v���[�gpsd�̓ǂݍ���
    if(!open(new File(foldername+"/"+filename+".psd")))return 0;

    var csvHeader = textdata[0];
    var csvLayerKind = textdata[1];
    //debug//alert(csvHeader+" "+csvHeader[0]);
    //csv��3�s�ڈȍ~�����[�v�ŌĂяo��
    for(var i=2;i<textdata.length;i++){
        //csv��2�s�ڂ̃t�@�C���w��ɂ��������āA�t�@�C����ǂݍ���
        for(var j=0;j<csvHeader.length;j++){
            try{
                if(0 == csvLayerKind[j]){
                    //csvLayerKind 0 is nonLayer
                }else if(1 == csvLayerKind[j]){
                    //csvLayerKind 1 is textLayer
                    activeDocument.artLayers[csvHeader[j]].textItem.contents = textdata[i][j];
                }else if(2 == csvLayerKind[j]){
                    var temp = activeDocument;
                    //csvLayerKind 2 is smartLayer
                    EditSmartobject(activeDocument.artLayers[csvHeader[j]],foldername+"/image/"+textdata[i][j]);
                    activeDocument = temp;
                }
            }catch(e){
                alert(e);
            }
        }
         //debug//alert(textdata[i]);

        //output png
        var fileObj = new File(foldername+"/"+filename+"/png/"+textdata[i][0]+".png");
        var pngOpt = new PNGSaveOptions();
        pngOpt.interlaced = false;
        activeDocument.saveAs(fileObj,pngOpt,true,Extension.LOWERCASE);
        SavePsd(activeDocument,foldername+"/"+filename+"/psd/"+textdata[i][0]+".psd");
    }

    //close psd
    activeDocument.close(SaveOptions.DONOTSAVECHANGES);
}

//pick up csv files
var filePath = File.openDialog("csv��I�����Ă��������B");
var fileName = String(filePath).split("/").pop();
var folderName = String(filePath).replace("/"+fileName,"");
//create cards each csv files
csv2png4testcard(folderName,fileName.split(".")[0]);

