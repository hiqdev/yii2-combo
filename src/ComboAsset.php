<?php

/*
 * Combo widget for Yii2
 *
 * @link      https://github.com/hiqdev/yii2-combo
 * @package   yii2-combo
 * @license   BSD-3-Clause
 * @copyright Copyright (c) 2015-2016, HiQDev (http://hiqdev.com/)
 */

namespace hiqdev\combo;

/**
 * Class ComboAsset.
 */
class ComboAsset extends \yii\web\AssetBundle
{
    public $sourcePath = '@vendor/hiqdev/yii2-combo/src/assets';

    public $js = [
        'combo.js',
    ];

    public $css = [
        'combo.css',
    ];

    public $depends = [
        'vova07\select2\Select2Asset',
    ];
}
