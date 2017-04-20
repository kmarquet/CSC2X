<?php

if (!empty($_POST))
    {
        /* $myfile = fopen("tmp.tex", "w")  */
        $latexcontent = file_get_contents("php://input");
        /* fwrite($myfile, $latexcontent); */
        /* fclose($myfile); */
        /* shell_exec("pdftex tmp.tex"); */
        /* $pdfdata = file_get_contents("tmp.pdf"); */
        /* header("Content-type: application/octet-stream"); */
        /* header("Content-disposition: attachment;filename=curricula.pdf"); */
        /* echo $pdfdata; */

        echo "OK j'ai reçu des trucs";
    }
else
{
    echo ":( j'ai rien reçu";
}
?>
