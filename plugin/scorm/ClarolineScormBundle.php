<?php

/*
 * This file is part of the Claroline Connect package.
 *
 * (c) Claroline Consortium <consortium@claroline.net>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Claroline\ScormBundle;

use Claroline\CoreBundle\Library\PluginBundle;
use Claroline\ScormBundle\Library\Installation\AdditionalInstaller;

class ClarolineScormBundle extends PluginBundle
{
    public function getAdditionalInstaller()
    {
        return new AdditionalInstaller();
    }
}
