<?php
/**
 * @link    http://hiqdev.com/yii2-combo
 * @license http://hiqdev.com/yii2-combo/license
 * @copyright Copyright (c) 2015 HiQDev
 */

namespace hiqdev\combo;

/**
 * Class ComboAsset
 *
 * @package hipanel\combo
 */
class ComboAsset extends \yii\web\AssetBundle
{
    public $sourcePath = '@vendor/hiqdev/yii2-combo';

    public $js = [
        'assets/combo.js'
    ];

    public $css = [
        'assets/combo.css'
    ];

    public $depends = [
        'vova07\select2\Select2Asset'
    ];
}
