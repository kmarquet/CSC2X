<?php

/* $latexcontent = "Ok :)"; */

/* trigger_error("attempt to convert latex to pdf\n"); */
/* throw new Exception('File exists');     */

header("Content-type: text/plain; charset=UTF-8");

try {
    $latexfile = "tmp.tex";
    $pdffile = "tmp.pdf";
    $latexcontent = file_get_contents('php://input');
    /* file_put_contents($latexfile, $latexcontent); */
    $data = shell_exec("xelatex $latexfile");
    echo $data;
    $data = shell_exec("ls -a");
    /* $data = file_get_contents($filename); */
    echo $data;
    
} catch (Exception $e) {
    echo "Ya eu une erreur\n";
}


/* fwrite($myfile, $latexcontent); */
/* $pdfdata = file_get_contents("tmp.pdf"); */
/* header("Content-type: application/octet-stream"); */
/* header("Content-disposition: attachment;filename=curricula.pdf"); */



/* header("Content-type: text/plain; charset=UTF-8"); */
/* header("Content-disposition: attachment;filename=tmp.tex"); */
/* readfile('tmp.tex'); */
?>
